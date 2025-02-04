import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { sync } from "fast-glob";
import JSON5 from "json5";
import type {
  BaseSchemaV1,
  PipelineV1,
  SchemaV1,
  BaseSchemaV2,
  PipelineV2,
} from "@nrz/types";
import * as logger from "./logger";
import { getNrzRoot } from "./getNrzRoot";
import type { PackageJson, PNPMWorkspaceConfig } from "./types";

const ROOT_GLOB = "nrz.json";
const ROOT_WORKSPACE_GLOB = "package.json";

export interface WorkspaceConfig {
  workspaceName: string;
  workspacePath: string;
  isWorkspaceRoot: boolean;
  nrzConfig?: SchemaV1;
}

export interface NrzConfig {
  config: SchemaV1;
  nrzConfigPath: string;
  workspacePath: string;
  isRootConfig: boolean;
}

export type NrzConfigs = Array<NrzConfig>;

interface Options {
  cache?: boolean;
}

const nrzConfigsCache: Record<string, NrzConfigs> = {};
const workspaceConfigCache: Record<string, Array<WorkspaceConfig>> = {};

// A quick and dirty workspace parser
// TODO: after @nrz/workspace-convert is merged, we can leverage those utils here
function getWorkspaceGlobs(root: string): Array<string> {
  try {
    if (fs.existsSync(path.join(root, "pnpm-workspace.yaml"))) {
      const workspaceConfig = yaml.load(
        fs.readFileSync(path.join(root, "pnpm-workspace.yaml"), "utf8")
      ) as PNPMWorkspaceConfig;

      return workspaceConfig.packages || [];
    }
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(root, "package.json"), "utf8")
    ) as PackageJson;
    if (packageJson.workspaces) {
      // support nested packages workspace format
      if ("packages" in packageJson.workspaces) {
        return packageJson.workspaces.packages || [];
      }

      if (Array.isArray(packageJson.workspaces)) {
        return packageJson.workspaces;
      }
    }
    return [];
  } catch (e) {
    return [];
  }
}

export function getNrzConfigs(cwd?: string, opts?: Options): NrzConfigs {
  const nrzRoot = getNrzRoot(cwd, opts);
  const configs: NrzConfigs = [];

  const cacheEnabled = opts?.cache ?? true;
  if (cacheEnabled && cwd && cwd in nrzConfigsCache) {
    return nrzConfigsCache[cwd];
  }

  // parse workspaces
  if (nrzRoot) {
    const workspaceGlobs = getWorkspaceGlobs(nrzRoot);
    const workspaceConfigGlobs = workspaceGlobs.map(
      (glob) => `${glob}/nrz.json`
    );

    const configPaths = sync([ROOT_GLOB, ...workspaceConfigGlobs], {
      cwd: nrzRoot,
      onlyFiles: true,
      followSymbolicLinks: false,
      // avoid throwing when encountering permission errors or unreadable paths
      suppressErrors: true,
    }).map((configPath) => path.join(nrzRoot, configPath));

    configPaths.forEach((configPath) => {
      try {
        const raw = fs.readFileSync(configPath, "utf8");
        // eslint-disable-next-line import/no-named-as-default-member -- json5 exports different objects depending on if you're using esm or cjs (https://github.com/json5/json5/issues/240)
        const nrzJsonContent: SchemaV1 = JSON5.parse(raw);
        // basic config validation
        const isRootConfig = path.dirname(configPath) === nrzRoot;
        if (isRootConfig) {
          // invalid - root config with extends
          if ("extends" in nrzJsonContent) {
            return;
          }
        } else if (!("extends" in nrzJsonContent)) {
          // invalid - workspace config with no extends
          return;
        }
        configs.push({
          config: nrzJsonContent,
          nrzConfigPath: configPath,
          workspacePath: path.dirname(configPath),
          isRootConfig,
        });
      } catch (e) {
        // if we can't read or parse the config, just ignore it with a warning
        logger.warn(e);
      }
    });
  }

  if (cacheEnabled && cwd) {
    nrzConfigsCache[cwd] = configs;
  }

  return configs;
}

export function getWorkspaceConfigs(
  cwd?: string,
  opts?: Options
): Array<WorkspaceConfig> {
  const nrzRoot = getNrzRoot(cwd, opts);
  const configs: Array<WorkspaceConfig> = [];

  const cacheEnabled = opts?.cache ?? true;
  if (cacheEnabled && cwd && cwd in workspaceConfigCache) {
    return workspaceConfigCache[cwd];
  }

  // parse workspaces
  if (nrzRoot) {
    const workspaceGlobs = getWorkspaceGlobs(nrzRoot);
    const workspaceConfigGlobs = workspaceGlobs.map(
      (glob) => `${glob}/package.json`
    );

    const configPaths = sync([ROOT_WORKSPACE_GLOB, ...workspaceConfigGlobs], {
      cwd: nrzRoot,
      onlyFiles: true,
      followSymbolicLinks: false,
      // avoid throwing when encountering permission errors or unreadable paths
      suppressErrors: true,
    }).map((configPath) => path.join(nrzRoot, configPath));

    configPaths.forEach((configPath) => {
      try {
        const rawPackageJson = fs.readFileSync(configPath, "utf8");
        const packageJsonContent = JSON.parse(rawPackageJson) as PackageJson;

        const workspaceName = packageJsonContent.name;
        const workspacePath = path.dirname(configPath);
        const isWorkspaceRoot = workspacePath === nrzRoot;

        // Try and get nrz.json
        const nrzJsonPath = path.join(workspacePath, "nrz.json");
        let rawNrzJson = null;
        let nrzConfig: SchemaV1 | undefined;
        try {
          rawNrzJson = fs.readFileSync(nrzJsonPath, "utf8");
          // eslint-disable-next-line import/no-named-as-default-member -- json5 exports different objects depending on if you're using esm or cjs (https://github.com/json5/json5/issues/240)
          nrzConfig = JSON5.parse(rawNrzJson);

          if (nrzConfig) {
            // basic config validation
            if (isWorkspaceRoot) {
              // invalid - root config with extends
              if ("extends" in nrzConfig) {
                return;
              }
            } else if (!("extends" in nrzConfig)) {
              // invalid - workspace config with no extends
              return;
            }
          }
        } catch (e) {
          // It is fine for there to not be a nrz.json.
        }

        configs.push({
          workspaceName,
          workspacePath,
          isWorkspaceRoot,
          nrzConfig,
        });
      } catch (e) {
        // if we can't read or parse the config, just ignore it with a warning
        logger.warn(e);
      }
    });
  }

  if (cacheEnabled && cwd) {
    workspaceConfigCache[cwd] = configs;
  }

  return configs;
}

export function forEachTaskDef<BaseSchema extends BaseSchemaV1 | BaseSchemaV2>(
  config: BaseSchema,
  f: (
    value: [string, BaseSchema extends BaseSchemaV1 ? PipelineV1 : PipelineV2]
  ) => void
): void {
  if ("pipeline" in config) {
    Object.entries(config.pipeline).forEach(f);
  } else {
    Object.entries(config.tasks).forEach(f);
  }
}
