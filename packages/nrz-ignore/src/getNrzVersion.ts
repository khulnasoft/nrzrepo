import fs from "node:fs";
import path from "node:path";
import type { PackageJson } from "@nrz/utils";
import { parse as JSON5Parse } from "json5";
import { error, info } from "./logger";
import type { NrzIgnoreOptions } from "./types";

export function getNrzVersion(
  args: NrzIgnoreOptions,
  root: string
): string | null {
  let { nrzVersion } = args;
  if (nrzVersion) {
    info(`Using nrz version "${nrzVersion}" from arguments`);
    return nrzVersion;
  }

  const packageJsonPath = path.join(root, "package.json");
  try {
    const raw = fs.readFileSync(packageJsonPath, "utf8");
    const packageJson = JSON.parse(raw) as PackageJson;
    const dependencies = packageJson.dependencies?.nrz;
    const devDependencies = packageJson.devDependencies?.nrz;
    nrzVersion = dependencies || devDependencies;
    if (nrzVersion !== undefined) {
      info(`Inferred nrz version "${nrzVersion}" from "package.json"`);
      return nrzVersion;
    }
  } catch (e) {
    error(
      `"${packageJsonPath}" could not be read. nrz-ignore nrz version inference failed`
    );
    return null;
  }

  const nrzJSONPath = path.join(root, "nrz.json");
  try {
    const rawNrzJson = fs.readFileSync(nrzJSONPath, "utf8");
    const nrzJson: { tasks?: unknown; pipeline?: unknown } =
      JSON5Parse(rawNrzJson);
    if ("tasks" in nrzJson) {
      info(`Inferred nrz version ^2 based on "tasks" in "nrz.json"`);
      return "^2";
    }
    if ("pipeline" in nrzJson) {
      info(`Inferred nrz version ^1 based on "pipeline" in "nrz.json"`);
      return "^1";
    }
    return null;
  } catch (e) {
    error(
      `"${nrzJSONPath}" could not be read. nrz-ignore nrz version inference failed`
    );
    return null;
  }
}
