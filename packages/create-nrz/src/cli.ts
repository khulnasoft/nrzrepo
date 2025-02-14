#!/usr/bin/env node

import http from "node:http";
import https from "node:https";
import picocolors from "picocolors";
import { Command, Option } from "commander";
import { logger } from "@nrz/utils";
import {
  type CreateNrzTelemetry,
  initTelemetry,
  withTelemetryCommand,
} from "@nrz/telemetry";
import { ProxyAgent } from "proxy-agent";
import cliPkg from "../package.json";
import { notifyUpdate } from "./utils/notifyUpdate";
import { create } from "./commands";

// Global telemetry client
let telemetryClient: CreateNrzTelemetry | undefined;

// Support http proxy vars
const agent = new ProxyAgent();
http.globalAgent = agent;
https.globalAgent = agent;

const createNrzCli = new Command();

// create
createNrzCli
  .name(picocolors.bold(logger.nrzGradient("create-nrz")))
  .description("Create a new Nrzrepo")
  .usage(`${picocolors.bold("<project-directory>")} [options]`)
  .hook("preAction", async (_, thisAction) => {
    const { telemetry } = await initTelemetry<"create-nrz">({
      packageInfo: {
        name: "create-nrz",
        version: cliPkg.version,
      },
    });
    // inject telemetry into the action as an option
    thisAction.addOption(
      new Option("--telemetry").default(telemetry).hideHelp()
    );
    telemetryClient = telemetry;
  })
  .hook("postAction", async () => {
    await telemetryClient?.close();
  })

  .argument("[project-directory]")
  .addOption(
    new Option(
      "-m, --package-manager <package-manager>",
      "Specify the package manager to use"
    ).choices(["npm", "yarn", "pnpm", "bun"])
  )
  .option(
    "--skip-install",
    "Do not run a package manager install after creating the project",
    false
  )
  .option(
    "--skip-transforms",
    "Do not run any code transformation after creating the project",
    false
  )
  .option(
    "--nrz-version <version>",
    "Use a specific version of nrz (default: latest)"
  )
  .option(
    "-e, --example <name>|<github-url>",
    `
  An example to bootstrap the app with. You can use an example name
  from the official Nrzrepo repo or a GitHub URL. The URL can use
  any branch and/or subdirectory
`
  )
  .option(
    "-p, --example-path <path-to-example>",
    `
  In a rare case, your GitHub URL might contain a branch name with
  a slash (e.g. bug/fix-1) and the path to the example (e.g. foo/bar).
  In this case, you must specify the path to the example separately:
  --example-path foo/bar
`
  )
  .version(cliPkg.version, "-v, --version", "Output the current version")
  .helpOption("-h, --help", "Display help for command")
  .action(create);

// Add telemetry command to the CLI
withTelemetryCommand(createNrzCli);

createNrzCli
  .parseAsync()
  .then(notifyUpdate)
  .catch(async (reason) => {
    logger.log();
    logger.error("Unexpected error. Please report it as a bug:");
    logger.log(reason);
    logger.log();
    await notifyUpdate();
    process.exit(1);
  });
