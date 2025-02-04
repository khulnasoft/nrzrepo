import path from "node:path";
import fs from "fs-extra";
import { getNrzConfigs } from "@nrz/utils";
import type { SchemaV2, SchemaV1 } from "@nrz/types";
import type { Transformer, TransformerArgs } from "../types";
import { getTransformerHelpers } from "../utils/getTransformerHelpers";
import type { TransformerResults } from "../runner";
import { loadNrzJson } from "../utils/loadNrzJson";

// transformer details
const TRANSFORMER = "rename-pipeline";
const DESCRIPTION = 'Rename the "pipeline" key to "tasks" in `nrz.json`';
const INTRODUCED_IN = "2.0.0-canary.0";

function migrateConfig(config: SchemaV1): SchemaV2 {
  const { pipeline, ...rest } = config;

  return { ...rest, tasks: pipeline };
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

  log.info("Renaming `pipeline` key in nrz.json to `tasks`");
  const nrzConfigPath = path.join(root, "nrz.json");
  if (!fs.existsSync(nrzConfigPath)) {
    return runner.abortTransform({
      reason: `No nrz.json found at ${root}. Is the path correct?`,
    });
  }

  const _nrzJson: SchemaV1 | SchemaV2 = loadNrzJson(nrzConfigPath);
  if ("tasks" in _nrzJson) {
    // Don't do anything
    log.info("nrz.json already has a tasks key, exiting");
    return runner.finish();
  }

  const nrzJson = _nrzJson as SchemaV1;
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
