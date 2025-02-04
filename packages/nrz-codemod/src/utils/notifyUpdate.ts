import picocolors from "picocolors";
import checkForUpdate from "update-check";
import { logger } from "@nrz/utils";
import { getWorkspaceDetails } from "@nrz/workspaces";
import cliPkgJson from "../../package.json";

const update = checkForUpdate(cliPkgJson).catch(() => null);

export async function notifyUpdate(): Promise<void> {
  try {
    const res = await update;
    if (res?.latest) {
      const { packageManager } = await getWorkspaceDetails({
        root: process.cwd(),
      });

      let upgradeCommand = "npm i -g @nrz/codemod";
      if (packageManager === "yarn") {
        upgradeCommand = "yarn global add @nrz/codemod";
      } else if (packageManager === "pnpm") {
        upgradeCommand = "pnpm i -g @nrz/codemod";
      }

      logger.log();
      logger.log(
        picocolors.yellow(
          picocolors.bold("A new version of `@nrz/codemod` is available!")
        )
      );
      logger.log(
        `You can update by running: ${picocolors.cyan(upgradeCommand)}`
      );
      logger.log();
    }
    process.exit();
  } catch (_) {
    // ignore error
  }
}
