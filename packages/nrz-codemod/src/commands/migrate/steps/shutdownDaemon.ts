import type { ExecSyncOptions } from "node:child_process";
import type { Project } from "@nrz/workspaces";
import { exec } from "../utils";

export function shutdownDaemon({ project }: { project: Project }) {
  try {
    const execOpts: ExecSyncOptions = {
      cwd: project.paths.root,
      stdio: "ignore",
    };
    // see if we have a global install
    const nrzBinaryPathFromGlobal = exec(`nrz bin`, execOpts);
    // if we do, shut it down
    if (nrzBinaryPathFromGlobal) {
      exec(`nrz daemon stop`, execOpts);
    } else {
      // call nrz using the project package manager to shut down the daemon
      let command = `${project.packageManager} nrz daemon stop`;
      if (project.packageManager === "npm") {
        command = `npm exec -c 'nrz daemon stop'`;
      }

      exec(command, execOpts);
    }
  } catch (e) {
    // skip
  }
}
