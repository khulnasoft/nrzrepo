import path from "node:path";
import type { PackageManager } from "@nrz/utils";

export function getWorkspaceDetailsMockReturnValue({
  root,
  packageManager = "npm",
}: {
  root: string;
  packageManager: PackageManager;
}) {
  return {
    name: "mock-project",
    packageManager,
    paths: {
      root,
      packageJson: path.join(root, "package.json"),
      lockfile: path.join(root, "yarn.lock"),
      nodeModules: path.join(root, "node_modules"),
    },
    workspaceData: {
      globs: ["packages/*"],
      workspaces: [
        {
          name: "packages/mock-package",
          paths: {
            root: path.join(root, "packages/mock-package"),
            packageJson: path.join(root, "packages/mock-package/package.json"),
            nodeModules: path.join(root, "packages/mock-package/node_modules"),
          },
        },
      ],
    },
  };
}
