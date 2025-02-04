import path from "node:path";
import fs from "fs-extra";
import type { RootSchema } from "@nrz/types";
import type { Transformer, TransformerArgs } from "../types";
import { getTransformerHelpers } from "../utils/getTransformerHelpers";
import type { TransformerResults } from "../runner";
import { loadNrzJson } from "../utils/loadNrzJson";

// transformer details
const TRANSFORMER = "stabilize-ui";
const DESCRIPTION = 'Rename the "experimentalUI" key to "ui" in `nrz.json`';
const INTRODUCED_IN = "2.0.0-canary.0";

interface ExperimentalSchema extends RootSchema {
  experimentalUI?: boolean;
}

function migrateConfig(config: ExperimentalSchema): RootSchema {
  const ui = config.experimentalUI;
  delete config.experimentalUI;
  // If UI is enabled we can just remove the config now that it's enabled by default
  if (ui !== undefined && !ui) {
    config.ui = "stream";
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

  log.info(`Renaming \`experimentalUI\` key in nrz.json to \`ui\``);
  const nrzConfigPath = path.join(root, "nrz.json");
  if (!fs.existsSync(nrzConfigPath)) {
    return runner.abortTransform({
      reason: `No nrz.json found at ${root}. Is the path correct?`,
    });
  }

  const nrzJson: RootSchema = loadNrzJson(nrzConfigPath);
  runner.modifyFile({
    filePath: nrzConfigPath,
    after: migrateConfig(nrzJson),
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
