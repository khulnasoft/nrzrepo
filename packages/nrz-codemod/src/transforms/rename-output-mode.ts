import path from "node:path";
import fs from "fs-extra";
import { type PackageJson, getNrzConfigs } from "@nrz/utils";
import type { PipelineV2, SchemaV1 } from "@nrz/types";
import type { Transformer, TransformerArgs } from "../types";
import { getTransformerHelpers } from "../utils/getTransformerHelpers";
import type { TransformerResults } from "../runner";
import { loadNrzJson } from "../utils/loadNrzJson";

// transformer details
const TRANSFORMER = "rename-output-mode";
const DESCRIPTION =
  'Rename the "outputMode" key to "outputLogs" in `nrz.json`';
const INTRODUCED_IN = "2.0.0-canary.0";

function migrateConfig(config: SchemaV1) {
  for (const [_, taskDef] of Object.entries(config.pipeline)) {
    if (Object.prototype.hasOwnProperty.call(taskDef, "outputMode")) {
      (taskDef as PipelineV2).outputLogs = taskDef.outputMode;
      delete taskDef.outputMode;
    }
  }

  return config;
}

export function transformer({
  root,
  options,
}: TransformerArgs): TransformerResults {
  const { log, runner } = getTransformerHelpers({
    transformer: TRANSFORMER,
    rootPath: root,
    options,
  });

  // If `nrz` key is detected in package.json, require user to run the other codemod first.
  const packageJsonPath = path.join(root, "package.json");
  // package.json should always exist, but if it doesn't, it would be a silly place to blow up this codemod
  let packageJSON = {};

  try {
    packageJSON = fs.readJsonSync(packageJsonPath) as PackageJson;
  } catch (e) {
    // readJSONSync probably failed because the file doesn't exist
  }

  if ("nrz" in packageJSON) {
    return runner.abortTransform({
      reason:
        '"nrz" key detected in package.json. Run `npx @nrz/codemod transform create-nrz-config` first',
    });
  }

  log.info("Renaming `outputMode` key in task config to `outputLogs`");
  const nrzConfigPath = path.join(root, "nrz.json");
  if (!fs.existsSync(nrzConfigPath)) {
    return runner.abortTransform({
      reason: `No nrz.json found at ${root}. Is the path correct?`,
    });
  }

  const nrzJson: SchemaV1 = loadNrzJson(nrzConfigPath);
  runner.modifyFile({
    filePath: nrzConfigPath,
    after: migrateConfig(nrzJson),
  });

  // find and migrate any workspace configs
  const workspaceConfigs = getNrzConfigs(root);
  workspaceConfigs.forEach((workspaceConfig) => {
    const { config, nrzConfigPath: filePath } = workspaceConfig;
    if ("pipeline" in config) {
      runner.modifyFile({
        filePath,
        after: migrateConfig(config),
      });
    }
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
