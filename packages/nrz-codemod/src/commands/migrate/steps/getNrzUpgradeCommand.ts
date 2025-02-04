import path from "node:path";
import fs from "fs-extra";
import { gte } from "semver";
import {
  getAvailablePackageManagers,
  getPackageManagersBinPaths,
  logger,
  type PackageManager,
  type PackageJson,
} from "@nrz/utils";
import type { Project } from "@nrz/workspaces";
import { exec } from "../utils";

type InstallType = "dependencies" | "devDependencies";

function getGlobalUpgradeCommand(
  packageManager: PackageManager,
  to = "latest"
) {
  switch (packageManager) {
    case "yarn":
      return `yarn global add nrz@${to}`;
    case "npm":
      return `npm install nrz@${to} --global`;
    case "pnpm":
      return `pnpm add nrz@${to} --global`;
    case "bun":
      return `bun add nrz@${to} --global`;
  }
}

function getLocalUpgradeCommand({
  packageManager,
  packageManagerVersion,
  installType,
  isUsingWorkspaces,
  to = "latest",
}: {
  packageManager: PackageManager;
  packageManagerVersion: string;
  installType: InstallType;
  isUsingWorkspaces?: boolean;
  to?: string;
}) {
  const renderCommand = (
    command: Array<string | boolean | undefined>
  ): string => command.filter(Boolean).join(" ");
  switch (packageManager) {
    // yarn command differs depending on the version
    case "yarn":
      // yarn 2.x and 3.x (berry)
      if (gte(packageManagerVersion, "2.0.0")) {
        return renderCommand([
          "yarn",
          "add",
          `nrz@${to}`,
          installType === "devDependencies" && "--dev",
        ]);
      }
      // yarn 1.x
      return renderCommand([
        "yarn",
        "add",
        `nrz@${to}`,
        installType === "devDependencies" && "--dev",
        isUsingWorkspaces && "-W",
      ]);

    case "npm":
      return renderCommand([
        "npm",
        "install",
        `nrz@${to}`,
        installType === "devDependencies" && "--save-dev",
      ]);
    case "pnpm":
      return renderCommand([
        "pnpm",
        "add",
        `nrz@${to}`,
        installType === "devDependencies" && "--save-dev",
        isUsingWorkspaces && "-w",
      ]);
    case "bun":
      return renderCommand([
        "bun",
        "add",
        `nrz@${to}`,
        installType === "devDependencies" && "--dev",
      ]);
  }
}

function getInstallType({ root }: { root: string }): InstallType | undefined {
  // read package.json to make sure we have a reference to nrz
  const packageJsonPath = path.join(root, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    logger.error(`Unable to find package.json at ${packageJsonPath}`);
    return undefined;
  }

  const packageJson = fs.readJsonSync(packageJsonPath) as PackageJson;
  const isDevDependency =
    packageJson.devDependencies && "nrz" in packageJson.devDependencies;
  const isDependency =
    packageJson.dependencies && "nrz" in packageJson.dependencies;

  if (isDependency || isDevDependency) {
    return isDependency ? "dependencies" : "devDependencies";
  }

  return undefined;
}

/**
  Finding the correct command to upgrade depends on two things:
  1. The package manager
  2. The install method (local or global)

  We try global first to let nrz handle the inference, then we try local.
**/
export async function getNrzUpgradeCommand({
  project,
  to,
}: {
  project: Project;
  to?: string;
}) {
  const nrzBinaryPathFromGlobal = exec("nrz bin", {
    cwd: project.paths.root,
    stdio: "pipe",
  });
  const packageManagerGlobalBinaryPaths = await getPackageManagersBinPaths();
  const globalPackageManager = Object.keys(
    packageManagerGlobalBinaryPaths
  ).find((packageManager) => {
    const packageManagerBinPath =
      packageManagerGlobalBinaryPaths[packageManager as PackageManager];
    if (packageManagerBinPath && nrzBinaryPathFromGlobal) {
      return nrzBinaryPathFromGlobal.includes(packageManagerBinPath);
    }

    return false;
  }) as PackageManager | undefined;

  if (nrzBinaryPathFromGlobal && globalPackageManager) {
    // figure which package manager we need to upgrade
    return getGlobalUpgradeCommand(globalPackageManager, to);
  }
  const { packageManager } = project;
  // we didn't find a global install, so we'll try to find a local one
  const isUsingWorkspaces = project.workspaceData.globs.length > 0;
  const installType = getInstallType({ root: project.paths.root });
  const availablePackageManagers = await getAvailablePackageManagers();
  const version = availablePackageManagers[packageManager];

  if (version && installType) {
    return getLocalUpgradeCommand({
      packageManager,
      packageManagerVersion: version,
      installType,
      isUsingWorkspaces,
      to,
    });
  }

  return undefined;
}
