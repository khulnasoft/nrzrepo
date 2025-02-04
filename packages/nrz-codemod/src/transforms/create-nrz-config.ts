import path from "node:path";
import fs from "fs-extra";
import { type PackageJson } from "@nrz/utils";
import type { Schema } from "@nrz/types";
import type { TransformerResults } from "../runner";
import { getTransformerHelpers } from "../utils/getTransformerHelpers";
import type { Transformer, TransformerArgs } from "../types";

// transformer details
const TRANSFORMER = "create-nrz-config";
const DESCRIPTION =
  'Create the `nrz.json` file from an existing "nrz" key in `package.json`';
const INTRODUCED_IN = "1.1.0";

export function transformer({
  root,
  options,
}: TransformerArgs): TransformerResults {
  const { log, runner } = getTransformerHelpers({
    transformer: TRANSFORMER,
    rootPath: root,
    options,
  });

  log.info(`Migrating "package.json" "nrz" key to "nrz.json" file...`);
  const nrzConfigPath = path.join(root, "nrz.json");
  const rootPackageJsonPath = path.join(root, "package.json");
  if (!fs.existsSync(rootPackageJsonPath)) {
    return runner.abortTransform({
      reason: `No package.json found at ${root}. Is the path correct?`,
    });
  }

  // read files
  const rootPackageJson = fs.readJsonSync(rootPackageJsonPath) as PackageJson;
  let rootNrzJson = null;
  try {
    rootNrzJson = fs.readJsonSync(nrzConfigPath) as Schema;
  } catch (err) {
    rootNrzJson = null;
  }

  // modify files
  let transformedPackageJson = rootPackageJson;
  let transformedNrzConfig = rootNrzJson;
  if (!rootNrzJson && rootPackageJson.nrz) {
    const { nrz: nrzConfig, ...remainingPkgJson } = rootPackageJson;
    transformedNrzConfig = nrzConfig;
    transformedPackageJson = remainingPkgJson;
  }

  runner.modifyFile({
    filePath: nrzConfigPath,
    after: transformedNrzConfig,
  });
  runner.modifyFile({
    filePath: rootPackageJsonPath,
    after: transformedPackageJson,
  });

  return runner.finish();
}

const transformerMeta: Transformer = {
  name: TRANSFORMER,
  description: DESCRIPTION,
  introducedIn: INTRODUCED_IN,
  transformer,
};

// eslint-disable-next-line import/no-default-export -- transforms require default export
export default transformerMeta;
