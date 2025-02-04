import { type Project } from "@nrz/workspaces";
import { exec } from "../utils";
import type { MigrateCommandOptions } from "../types";

export function getCurrentVersion(
  project: Project,
  opts: MigrateCommandOptions
): string | undefined {
  const { from } = opts;
  if (from) {
    return from;
  }

  // try global first
  const nrzVersionFromGlobal = exec(`nrz --version`, {
    cwd: project.paths.root,
  });

  if (nrzVersionFromGlobal) {
    return nrzVersionFromGlobal;
  }

  const { packageManager } = project;
  if (packageManager === "yarn") {
    return exec(`yarn nrz --version`, { cwd: project.paths.root });
  }
  if (packageManager === "pnpm") {
    return exec(`pnpm nrz --version`, { cwd: project.paths.root });
  }

  return exec(`npm exec -c 'nrz --version'`, { cwd: project.paths.root });
}
