import path from "node:path";
import fs from "fs-extra";
import {
  type PackageJson,
  getNrzConfigs,
  forEachTaskDef,
} from "@nrz/utils";
import type { SchemaV1 } from "@nrz/types";
import type { Transformer, TransformerArgs } from "../types";
import { getTransformerHelpers } from "../utils/getTransformerHelpers";
import type { TransformerResults } from "../runner";
import { loadNrzJson } from "../utils/loadNrzJson";

// transformer details
const TRANSFORMER = "migrate-dot-env";
const DESCRIPTION = 'Migrate the "dotEnv" entries to "inputs" in `nrz.json`';
const INTRODUCED_IN = "2.0.0-canary.0";

function migrateConfig(configV1: SchemaV1) {
  if ("globalDotEnv" in configV1) {
    if (configV1.globalDotEnv) {
      configV1.globalDependencies = configV1.globalDependencies ?? [];
      for (const dotEnvPath of configV1.globalDotEnv) {
        configV1.globalDependencies.push(dotEnvPath);
      }
    }
    delete configV1.globalDotEnv;
  }

  forEachTaskDef(configV1, ([_, taskDef]) => {
    if ("dotEnv" in taskDef) {
      if (taskDef.dotEnv) {
        taskDef.inputs = taskDef.inputs ?? ["$NRZ_DEFAULT$"];
        for (const dotEnvPath of taskDef.dotEnv) {
          taskDef.inputs.push(dotEnvPath);
        }
      }
      delete taskDef.dotEnv;
    }
  });

  return configV1;
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

  log.info("Moving entries in `dotEnv` key in task config to `inputs`");
  const nrzConfigPath = path.join(root, "nrz.json");
  if (!fs.existsSync(nrzConfigPath)) {
    return runner.abortTransform({
      reason: `No nrz.json found at ${root}. Is the path correct?`,
    });
  }

  const nrzJson = loadNrzJson<SchemaV1>(nrzConfigPath);
  runner.modifyFile({
    filePath: nrzConfigPath,
    after: migrateConfig(nrzJson),
  });

  // find and migrate any workspace configs
  const workspaceConfigs = getNrzConfigs(root);
  workspaceConfigs.forEach((workspaceConfig) => {
    const { config, nrzConfigPath: filePath } = workspaceConfig;
    runner.modifyFile({
      filePath,
      after: migrateConfig(config),
    });
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
