import path from "node:path";
import childProcess from "node:child_process";
import picocolors from "picocolors";
import { setupTestFixtures, spyConsole, spyExit } from "@nrz/test-utils";
import { logger } from "@nrz/utils";
import type { PackageManager } from "@nrz/utils";
// imports for mocks
import * as nrzWorkspaces from "@nrz/workspaces";
import { CreateNrzTelemetry, TelemetryConfig } from "@nrz/telemetry";
import * as nrzUtils from "@nrz/utils";
import { describe, it, expect, jest } from "@jest/globals";
import type { CreateCommandArgument } from "../src/commands/create/types";
import { create } from "../src/commands/create";
import { getWorkspaceDetailsMockReturnValue } from "./test-utils";

jest.mock<typeof import("@nrz/workspaces")>("@nrz/workspaces", () => ({
  __esModule: true,
  ...jest.requireActual("@nrz/workspaces"),
}));

describe("create-nrz", () => {
  const { useFixture } = setupTestFixtures({
    directory: path.join(__dirname, "../"),
    options: { emptyFixture: true },
  });

  const mockConsole = spyConsole();
  const mockExit = spyExit();
  const telemetry = new CreateNrzTelemetry({
    api: "https://example.com",
    packageInfo: {
      name: "create-nrz",
      version: "1.0.0",
    },
    config: new TelemetryConfig({
      configPath: "test-config-path",
      config: {
        telemetry_enabled: false,
        telemetry_id: "telemetry-test-id",
        telemetry_salt: "telemetry-salt",
      },
    }),
  });

  it.each<{ packageManager: PackageManager }>([
    { packageManager: "yarn" },
    { packageManager: "npm" },
    { packageManager: "pnpm" },
    { packageManager: "bun" },
  ])(
    "outputs expected console messages when using $packageManager (option)",
    async ({ packageManager }) => {
      const { root } = useFixture({ fixture: "create-nrz" });

      const availableScripts = ["build", "test", "dev"];

      const mockAvailablePackageManagers = jest
        .spyOn(nrzUtils, "getAvailablePackageManagers")
        .mockResolvedValue({
          npm: "8.19.2",
          yarn: "1.22.10",
          pnpm: "7.22.2",
          bun: "1.0.1",
        });

      const mockCreateProject = jest
        .spyOn(nrzUtils, "createProject")
        .mockResolvedValue({
          cdPath: "",
          hasPackageJson: true,
          availableScripts,
        });

      const mockGetWorkspaceDetails = jest
        .spyOn(nrzWorkspaces, "getWorkspaceDetails")
        .mockResolvedValue(
          getWorkspaceDetailsMockReturnValue({
            root,
            packageManager,
          })
        );

      const mockExecSync = jest
        .spyOn(childProcess, "execSync")
        .mockImplementation(() => {
          return "success";
        });

      await create(root as CreateCommandArgument, {
        packageManager,
        skipInstall: true,
        example: "default",
        telemetry,
      });

      const expected = `${picocolors.bold(
        logger.nrzGradient(">>> Success!")
      )} Created your Nrzrepo at ${picocolors.green(
        path.relative(process.cwd(), root)
      )}`;
      expect(mockConsole.log).toHaveBeenCalledWith(expected);
      expect(mockConsole.log).toHaveBeenCalledWith();
      expect(mockConsole.log).toHaveBeenCalledWith(
        picocolors.bold("To get started:")
      );

      expect(mockConsole.log).toHaveBeenCalledWith(
        picocolors.cyan("Library packages")
      );

      expect(mockConsole.log).toHaveBeenCalledWith(
        "- Run commands with Nrzrepo:"
      );

      availableScripts.forEach((script) => {
        expect(mockConsole.log).toHaveBeenCalledWith(
          expect.stringContaining(
            picocolors.cyan(`${packageManager} run ${script}`)
          )
        );
      });

      expect(mockConsole.log).toHaveBeenCalledWith(
        "- Run a command twice to hit cache"
      );

      mockAvailablePackageManagers.mockRestore();
      mockCreateProject.mockRestore();
      mockGetWorkspaceDetails.mockRestore();
      mockExecSync.mockRestore();
    }
  );

  it.each<{ packageManager: PackageManager }>([
    { packageManager: "yarn" },
    { packageManager: "npm" },
    { packageManager: "pnpm" },
    { packageManager: "bun" },
  ])(
    "outputs expected console messages when using $packageManager (arg)",
    async ({ packageManager }) => {
      const { root } = useFixture({ fixture: "create-nrz" });

      const availableScripts = ["build", "test", "dev"];

      const mockAvailablePackageManagers = jest
        .spyOn(nrzUtils, "getAvailablePackageManagers")
        .mockResolvedValue({
          npm: "8.19.2",
          yarn: "1.22.10",
          pnpm: "7.22.2",
          bun: "1.0.1",
        });

      const mockCreateProject = jest
        .spyOn(nrzUtils, "createProject")
        .mockResolvedValue({
          cdPath: "",
          hasPackageJson: true,
          availableScripts,
        });

      const mockGetWorkspaceDetails = jest
        .spyOn(nrzWorkspaces, "getWorkspaceDetails")
        .mockResolvedValue(
          getWorkspaceDetailsMockReturnValue({
            root,
            packageManager,
          })
        );

      const mockExecSync = jest
        .spyOn(childProcess, "execSync")
        .mockImplementation(() => {
          return "success";
        });

      await create(root as CreateCommandArgument, {
        packageManager,
        skipInstall: true,
        example: "default",
        telemetry,
      });

      const expected = `${picocolors.bold(
        logger.nrzGradient(">>> Success!")
      )} Created your Nrzrepo at ${picocolors.green(
        path.relative(process.cwd(), root)
      )}`;
      expect(mockConsole.log).toHaveBeenCalledWith(expected);
      expect(mockConsole.log).toHaveBeenCalledWith();
      expect(mockConsole.log).toHaveBeenCalledWith(
        picocolors.bold("To get started:")
      );

      expect(mockConsole.log).toHaveBeenCalledWith(
        picocolors.cyan("Library packages")
      );

      expect(mockConsole.log).toHaveBeenCalledWith(
        "- Run commands with Nrzrepo:"
      );

      availableScripts.forEach((script) => {
        expect(mockConsole.log).toHaveBeenCalledWith(
          expect.stringContaining(
            picocolors.cyan(`${packageManager} run ${script}`)
          )
        );
      });

      expect(mockConsole.log).toHaveBeenCalledWith(
        "- Run a command twice to hit cache"
      );
      mockAvailablePackageManagers.mockRestore();
      mockCreateProject.mockRestore();
      mockGetWorkspaceDetails.mockRestore();
      mockExecSync.mockRestore();
    }
  );

  it("throws correct error message when a download error is encountered", async () => {
    const { root } = useFixture({ fixture: "create-nrz" });
    const packageManager = "pnpm";
    const mockAvailablePackageManagers = jest
      .spyOn(nrzUtils, "getAvailablePackageManagers")
      .mockResolvedValue({
        npm: "8.19.2",
        yarn: "1.22.10",
        pnpm: "7.22.2",
        bun: "1.0.1",
      });

    const mockCreateProject = jest
      .spyOn(nrzUtils, "createProject")
      .mockRejectedValue(new nrzUtils.DownloadError("Could not connect"));

    const mockGetWorkspaceDetails = jest
      .spyOn(nrzWorkspaces, "getWorkspaceDetails")
      .mockResolvedValue(
        getWorkspaceDetailsMockReturnValue({
          root,
          packageManager,
        })
      );

    const mockExecSync = jest
      .spyOn(childProcess, "execSync")
      .mockImplementation(() => {
        return "success";
      });

    await create(root as CreateCommandArgument, {
      packageManager,
      skipInstall: true,
      example: "default",
      telemetry,
    });

    expect(mockConsole.error).toHaveBeenCalledTimes(2);
    expect(mockConsole.error).toHaveBeenNthCalledWith(
      1,
      logger.nrzRed(picocolors.bold(">>>")),
      picocolors.red("Unable to download template from GitHub")
    );
    expect(mockConsole.error).toHaveBeenNthCalledWith(
      2,
      logger.nrzRed(picocolors.bold(">>>")),
      picocolors.red("Could not connect")
    );
    expect(mockExit.exit).toHaveBeenCalledWith(1);

    mockAvailablePackageManagers.mockRestore();
    mockCreateProject.mockRestore();
    mockGetWorkspaceDetails.mockRestore();
    mockExecSync.mockRestore();
  });
});
