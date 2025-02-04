import path from "node:path";
import fs from "fs-extra";
import { type PackageJson, getNrzConfigs } from "@nrz/utils";
import type { RootSchemaV1, SchemaV1, EnvWildcard } from "@nrz/types";
import type { Transformer, TransformerArgs } from "../types";
import { getTransformerHelpers } from "../utils/getTransformerHelpers";
import type { TransformerResults } from "../runner";
import { loadNrzJson } from "../utils/loadNrzJson";

// transformer details
const TRANSFORMER = "transform-env-literals-to-wildcards";
const DESCRIPTION = "Rewrite env fields to distinguish wildcards from literals";
const INTRODUCED_IN = "1.10.0";

// Rewriting of environment variable names.
function transformEnvVarName(envVarName: string): EnvWildcard {
  let output = envVarName;

  // Transform leading !
  if (envVarName.startsWith("!")) {
    output = `\\${output}`;
  }

  // Transform literal asterisks
  output = output.replace(/\*/g, "\\*");

  return output;
}

function migrateRootConfig(config: RootSchemaV1) {
  const { globalEnv, globalPassThroughEnv } = config;

  if (Array.isArray(globalEnv)) {
    config.globalEnv = globalEnv.map(transformEnvVarName);
  }
  if (Array.isArray(globalPassThroughEnv)) {
    config.globalPassThroughEnv = globalPassThroughEnv.map(transformEnvVarName);
  }

  return migrateTaskConfigs(config);
}

function migrateTaskConfigs(config: SchemaV1) {
  for (const [_, taskDef] of Object.entries(config.pipeline)) {
    const { env, passThroughEnv } = taskDef;

    if (Array.isArray(env)) {
      taskDef.env = env.map(transformEnvVarName);
    }
    if (Array.isArray(passThroughEnv)) {
      taskDef.passThroughEnv = passThroughEnv.map(transformEnvVarName);
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

  log.info("Rewriting env vars to support wildcards");
  const nrzConfigPath = path.join(root, "nrz.json");
  if (!fs.existsSync(nrzConfigPath)) {
    return runner.abortTransform({
      reason: `No nrz.json found at ${root}. Is the path correct?`,
    });
  }

  const nrzJson: SchemaV1 = loadNrzJson(nrzConfigPath);
  runner.modifyFile({
    filePath: nrzConfigPath,
    after: migrateRootConfig(nrzJson),
  });

  // find and migrate any workspace configs
  const allNrzJsons = getNrzConfigs(root);
  allNrzJsons.forEach((workspaceConfig) => {
    const { config, nrzConfigPath: filePath, isRootConfig } = workspaceConfig;
    if (!isRootConfig && "pipeline" in config) {
      runner.modifyFile({
        filePath,
        after: migrateTaskConfigs(config),
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
