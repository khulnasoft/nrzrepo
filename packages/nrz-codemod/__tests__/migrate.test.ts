import childProcess from "node:child_process";
import * as nrzUtils from "@nrz/utils";
import * as nrzWorkspaces from "@nrz/workspaces";
import { setupTestFixtures, spyExit } from "@nrz/test-utils";
import { describe, it, expect, jest } from "@jest/globals";
import { migrate } from "../src/commands/migrate";
import * as checkGitStatus from "../src/utils/checkGitStatus";
import * as getCurrentVersion from "../src/commands/migrate/steps/getCurrentVersion";
import * as getLatestVersion from "../src/commands/migrate/steps/getLatestVersion";
import * as getNrzUpgradeCommand from "../src/commands/migrate/steps/getNrzUpgradeCommand";
import { getWorkspaceDetailsMockReturnValue } from "./test-utils";

jest.mock<typeof import("@nrz/workspaces")>("@nrz/workspaces", () => ({
  __esModule: true,
  ...jest.requireActual("@nrz/workspaces"),
}));

describe("migrate", () => {
  const mockExit = spyExit();
  const { useFixture } = setupTestFixtures({
    directory: __dirname,
    test: "migrate",
  });

  it("migrates from 1.0.0 to 1.7.0", async () => {
    const { root, readJson } = useFixture({
      fixture: "old-nrz",
    });

    const packageManager = "pnpm";
    const packageManagerVersion = "1.2.3";

    // setup mocks
    const mockedCheckGitStatus = jest
      .spyOn(checkGitStatus, "checkGitStatus")
      .mockReturnValue(undefined);
    const mockedGetCurrentVersion = jest
      .spyOn(getCurrentVersion, "getCurrentVersion")
      .mockReturnValue("1.0.0");
    const mockedGetLatestVersion = jest
      .spyOn(getLatestVersion, "getLatestVersion")
      .mockResolvedValue("1.7.0");
    const mockedGetNrzUpgradeCommand = jest
      .spyOn(getNrzUpgradeCommand, "getNrzUpgradeCommand")
      .mockResolvedValue("pnpm install -g nrz@latest");
    const mockedGetAvailablePackageManagers = jest
      .spyOn(nrzUtils, "getAvailablePackageManagers")
      .mockResolvedValue({
        pnpm: packageManagerVersion,
        npm: undefined,
        yarn: undefined,
        bun: undefined,
      });
    const mockedGetWorkspaceDetails = jest
      .spyOn(nrzWorkspaces, "getWorkspaceDetails")
      .mockResolvedValue(
        getWorkspaceDetailsMockReturnValue({
          root,
          packageManager,
        })
      );

    await migrate(root, {
      force: false,
      dryRun: false,
      print: false,
      install: false,
    });

    expect(readJson("package.json")).toStrictEqual({
      dependencies: {},
      devDependencies: {
        nrz: "1.0.0",
      },
      name: "no-nrz-json",
      packageManager: "pnpm@1.2.3",
      version: "1.0.0",
    });
    expect(readJson("nrz.json")).toStrictEqual({
      $schema: "https://turbo.build/schema.json",
      pipeline: {
        build: {
          outputs: [".next/**", "!.next/cache/**"],
        },
        dev: {
          cache: false,
        },
        lint: {},
        test: {
          outputs: ["dist/**", "build/**"],
        },
      },
    });

    // verify mocks were called
    expect(mockedCheckGitStatus).toHaveBeenCalled();
    expect(mockedGetCurrentVersion).toHaveBeenCalled();
    expect(mockedGetLatestVersion).toHaveBeenCalled();
    expect(mockedGetNrzUpgradeCommand).toHaveBeenCalled();
    expect(mockedGetAvailablePackageManagers).toHaveBeenCalled();
    expect(mockedGetWorkspaceDetails).toHaveBeenCalled();

    // restore mocks
    mockedCheckGitStatus.mockRestore();
    mockedGetCurrentVersion.mockRestore();
    mockedGetLatestVersion.mockRestore();
    mockedGetNrzUpgradeCommand.mockRestore();
    mockedGetAvailablePackageManagers.mockRestore();
    mockedGetWorkspaceDetails.mockRestore();
  });

  it("migrates from 1.0.0 to 1.2.0 (dry run)", async () => {
    const { root, readJson } = useFixture({
      fixture: "old-nrz",
    });

    const packageManager = "pnpm";
    const packageManagerVersion = "1.2.3";

    // setup mocks
    const mockedCheckGitStatus = jest
      .spyOn(checkGitStatus, "checkGitStatus")
      .mockReturnValue(undefined);
    const mockedGetCurrentVersion = jest
      .spyOn(getCurrentVersion, "getCurrentVersion")
      .mockReturnValue("1.0.0");
    const mockedGetLatestVersion = jest
      .spyOn(getLatestVersion, "getLatestVersion")
      .mockResolvedValue("1.2.0");
    const mockedGetNrzUpgradeCommand = jest
      .spyOn(getNrzUpgradeCommand, "getNrzUpgradeCommand")
      .mockResolvedValue("pnpm install -g nrz@latest");
    const mockedGetAvailablePackageManagers = jest
      .spyOn(nrzUtils, "getAvailablePackageManagers")
      .mockResolvedValue({
        pnpm: packageManagerVersion,
        npm: undefined,
        yarn: undefined,
        bun: undefined,
      });
    const mockedGetWorkspaceDetails = jest
      .spyOn(nrzWorkspaces, "getWorkspaceDetails")
      .mockResolvedValue(
        getWorkspaceDetailsMockReturnValue({
          root,
          packageManager,
        })
      );

    const packageJson = readJson("package.json");
    const nrzJson = readJson("nrz.json");

    await migrate(root, {
      force: false,
      dryRun: true,
      print: false,
      install: true,
    });

    // make sure nothing changed
    expect(readJson("package.json")).toStrictEqual(packageJson);
    expect(readJson("nrz.json")).toStrictEqual(nrzJson);

    // verify mocks were called
    expect(mockedCheckGitStatus).not.toHaveBeenCalled();
    expect(mockedGetCurrentVersion).toHaveBeenCalled();
    expect(mockedGetLatestVersion).toHaveBeenCalled();
    expect(mockedGetNrzUpgradeCommand).toHaveBeenCalled();
    expect(mockedGetAvailablePackageManagers).toHaveBeenCalled();
    expect(mockedGetWorkspaceDetails).toHaveBeenCalled();

    // restore mocks
    mockedCheckGitStatus.mockRestore();
    mockedGetCurrentVersion.mockRestore();
    mockedGetLatestVersion.mockRestore();
    mockedGetNrzUpgradeCommand.mockRestore();
    mockedGetAvailablePackageManagers.mockRestore();
    mockedGetWorkspaceDetails.mockRestore();
  });

  it("next version can be passed as an option", async () => {
    const { root, readJson } = useFixture({
      fixture: "old-nrz",
    });

    const packageManager = "pnpm";
    const packageManagerVersion = "1.2.3";

    // setup mocks
    const mockedCheckGitStatus = jest
      .spyOn(checkGitStatus, "checkGitStatus")
      .mockReturnValue(undefined);
    const mockedGetCurrentVersion = jest
      .spyOn(getCurrentVersion, "getCurrentVersion")
      .mockReturnValue("1.0.0");
    const mockedGetLatestVersion = jest
      .spyOn(getLatestVersion, "getLatestVersion")
      .mockResolvedValue("1.7.0");
    const mockedGetNrzUpgradeCommand = jest
      .spyOn(getNrzUpgradeCommand, "getNrzUpgradeCommand")
      .mockResolvedValue("pnpm install -g nrz@latest");
    const mockedGetAvailablePackageManagers = jest
      .spyOn(nrzUtils, "getAvailablePackageManagers")
      .mockResolvedValue({
        pnpm: packageManagerVersion,
        npm: undefined,
        yarn: undefined,
        bun: undefined,
      });
    const mockedGetWorkspaceDetails = jest
      .spyOn(nrzWorkspaces, "getWorkspaceDetails")
      .mockResolvedValue(
        getWorkspaceDetailsMockReturnValue({
          root,
          packageManager,
        })
      );

    await migrate(root, {
      force: false,
      dryRun: false,
      print: false,
      install: false,
      to: "1.7.0",
    });

    expect(readJson("package.json")).toStrictEqual({
      dependencies: {},
      devDependencies: {
        nrz: "1.0.0",
      },
      name: "no-nrz-json",
      packageManager: "pnpm@1.2.3",
      version: "1.0.0",
    });
    expect(readJson("nrz.json")).toStrictEqual({
      $schema: "https://turbo.build/schema.json",
      pipeline: {
        build: {
          outputs: [".next/**", "!.next/cache/**"],
        },
        dev: {
          cache: false,
        },
        test: {
          outputs: ["dist/**", "build/**"],
        },
        lint: {},
      },
    });

    // verify mocks were called
    expect(mockedCheckGitStatus).toHaveBeenCalled();
    expect(mockedGetCurrentVersion).toHaveBeenCalled();
    expect(mockedGetLatestVersion).toHaveBeenCalled();
    expect(mockedGetNrzUpgradeCommand).toHaveBeenCalled();
    expect(mockedGetAvailablePackageManagers).toHaveBeenCalled();
    expect(mockedGetWorkspaceDetails).toHaveBeenCalled();

    // restore mocks
    mockedCheckGitStatus.mockRestore();
    mockedGetCurrentVersion.mockRestore();
    mockedGetLatestVersion.mockRestore();
    mockedGetNrzUpgradeCommand.mockRestore();
    mockedGetAvailablePackageManagers.mockRestore();
    mockedGetWorkspaceDetails.mockRestore();
  });

  it("current version can be passed as an option", async () => {
    const { root, readJson } = useFixture({
      fixture: "old-nrz",
    });

    const packageManager = "pnpm";
    const packageManagerVersion = "1.2.3";

    // setup mocks
    const mockedCheckGitStatus = jest
      .spyOn(checkGitStatus, "checkGitStatus")
      .mockReturnValue(undefined);
    const mockedGetLatestVersion = jest
      .spyOn(getLatestVersion, "getLatestVersion")
      .mockResolvedValue("1.7.0");
    const mockedGetNrzUpgradeCommand = jest
      .spyOn(getNrzUpgradeCommand, "getNrzUpgradeCommand")
      .mockResolvedValue("pnpm install -g nrz@latest");
    const mockedGetAvailablePackageManagers = jest
      .spyOn(nrzUtils, "getAvailablePackageManagers")
      .mockResolvedValue({
        pnpm: packageManagerVersion,
        npm: undefined,
        yarn: undefined,
        bun: undefined,
      });
    const mockedGetWorkspaceDetails = jest
      .spyOn(nrzWorkspaces, "getWorkspaceDetails")
      .mockResolvedValue(
        getWorkspaceDetailsMockReturnValue({
          root,
          packageManager,
        })
      );

    await migrate(root, {
      force: false,
      dryRun: false,
      print: false,
      install: false,
      from: "1.0.0",
    });

    expect(readJson("package.json")).toStrictEqual({
      dependencies: {},
      devDependencies: {
        nrz: "1.0.0",
      },
      name: "no-nrz-json",
      packageManager: "pnpm@1.2.3",
      version: "1.0.0",
    });
    expect(readJson("nrz.json")).toStrictEqual({
      $schema: "https://turbo.build/schema.json",
      pipeline: {
        build: {
          outputs: [".next/**", "!.next/cache/**"],
        },
        dev: {
          cache: false,
        },
        lint: {},
        test: {
          outputs: ["dist/**", "build/**"],
        },
      },
    });

    // verify mocks were called
    expect(mockedCheckGitStatus).toHaveBeenCalled();
    expect(mockedGetLatestVersion).toHaveBeenCalled();
    expect(mockedGetNrzUpgradeCommand).toHaveBeenCalled();
    expect(mockedGetAvailablePackageManagers).toHaveBeenCalled();
    expect(mockedGetWorkspaceDetails).toHaveBeenCalled();

    // restore mocks
    mockedCheckGitStatus.mockRestore();
    mockedGetLatestVersion.mockRestore();
    mockedGetNrzUpgradeCommand.mockRestore();
    mockedGetAvailablePackageManagers.mockRestore();
    mockedGetWorkspaceDetails.mockRestore();
  });

  it("exits if the current version is the same as the new version", async () => {
    const { root } = useFixture({
      fixture: "old-nrz",
    });

    const packageManager = "pnpm";

    // setup mocks
    const mockedCheckGitStatus = jest
      .spyOn(checkGitStatus, "checkGitStatus")
      .mockReturnValue(undefined);
    const mockedGetCurrentVersion = jest
      .spyOn(getCurrentVersion, "getCurrentVersion")
      .mockReturnValue("1.7.0");
    const mockedGetLatestVersion = jest
      .spyOn(getLatestVersion, "getLatestVersion")
      .mockResolvedValue("1.7.0");
    const mockedGetWorkspaceDetails = jest
      .spyOn(nrzWorkspaces, "getWorkspaceDetails")
      .mockResolvedValue(
        getWorkspaceDetailsMockReturnValue({
          root,
          packageManager,
        })
      );

    await migrate(root, {
      force: false,
      dryRun: false,
      print: false,
      install: false,
    });

    expect(mockExit.exit).toHaveBeenCalledWith(0);

    // verify mocks were called
    expect(mockedCheckGitStatus).toHaveBeenCalled();
    expect(mockedGetCurrentVersion).toHaveBeenCalled();
    expect(mockedGetLatestVersion).toHaveBeenCalled();
    expect(mockedGetWorkspaceDetails).toHaveBeenCalled();

    // restore mocks
    mockedCheckGitStatus.mockRestore();
    mockedGetCurrentVersion.mockRestore();
    mockedGetWorkspaceDetails.mockRestore();
  });

  it("continues when migration doesn't require codemods", async () => {
    const { root } = useFixture({
      fixture: "old-nrz",
    });

    const packageManager = "npm";

    // setup mocks
    const mockedCheckGitStatus = jest
      .spyOn(checkGitStatus, "checkGitStatus")
      .mockReturnValue(undefined);
    const mockedGetCurrentVersion = jest
      .spyOn(getCurrentVersion, "getCurrentVersion")
      .mockReturnValue("1.3.0");
    const mockedGetLatestVersion = jest
      .spyOn(getLatestVersion, "getLatestVersion")
      .mockResolvedValue("1.3.1");
    const mockedGetNrzUpgradeCommand = jest
      .spyOn(getNrzUpgradeCommand, "getNrzUpgradeCommand")
      .mockResolvedValue("npm install nrz@1.3.1");
    const mockedExecSync = jest
      .spyOn(childProcess, "execSync")
      .mockReturnValue("installed");
    const mockedGetWorkspaceDetails = jest
      .spyOn(nrzWorkspaces, "getWorkspaceDetails")
      .mockResolvedValue(
        getWorkspaceDetailsMockReturnValue({
          root,
          packageManager,
        })
      );

    await migrate(root, {
      force: false,
      dryRun: false,
      print: false,
      install: true,
    });

    // verify mocks were called
    expect(mockedCheckGitStatus).toHaveBeenCalled();
    expect(mockedGetCurrentVersion).toHaveBeenCalled();
    expect(mockedGetLatestVersion).toHaveBeenCalled();
    expect(mockedGetNrzUpgradeCommand).toHaveBeenCalled();
    expect(mockedGetWorkspaceDetails).toHaveBeenCalled();
    expect(mockedExecSync).toHaveBeenNthCalledWith(1, "nrz bin", {
      cwd: root,
      stdio: "ignore",
    });
    expect(mockedExecSync).toHaveBeenNthCalledWith(2, "nrz daemon stop", {
      cwd: root,
      stdio: "ignore",
    });
    expect(mockedExecSync).toHaveBeenNthCalledWith(
      3,
      "npm install nrz@1.3.1",
      {
        cwd: root,
        stdio: "pipe",
      }
    );

    // restore mocks
    mockedCheckGitStatus.mockRestore();
    mockedGetCurrentVersion.mockRestore();
    mockedGetLatestVersion.mockRestore();
    mockedGetNrzUpgradeCommand.mockRestore();
    mockedGetWorkspaceDetails.mockRestore();
    mockedExecSync.mockRestore();
  });

  it("installs the correct nrz version", async () => {
    const { root, readJson } = useFixture({
      fixture: "old-nrz",
    });

    const packageManager = "pnpm";
    const packageManagerVersion = "1.2.3";

    // setup mocks
    const mockedCheckGitStatus = jest
      .spyOn(checkGitStatus, "checkGitStatus")
      .mockReturnValue(undefined);
    const mockedGetCurrentVersion = jest
      .spyOn(getCurrentVersion, "getCurrentVersion")
      .mockReturnValue("1.0.0");
    const mockedGetLatestVersion = jest
      .spyOn(getLatestVersion, "getLatestVersion")
      .mockResolvedValue("1.7.0");
    const mockedGetNrzUpgradeCommand = jest
      .spyOn(getNrzUpgradeCommand, "getNrzUpgradeCommand")
      .mockResolvedValue("pnpm install -g nrz@1.7.0");
    const mockedGetAvailablePackageManagers = jest
      .spyOn(nrzUtils, "getAvailablePackageManagers")
      .mockResolvedValue({
        pnpm: packageManagerVersion,
        npm: undefined,
        yarn: undefined,
        bun: undefined,
      });
    const mockedGetWorkspaceDetails = jest
      .spyOn(nrzWorkspaces, "getWorkspaceDetails")
      .mockResolvedValue(
        getWorkspaceDetailsMockReturnValue({
          root,
          packageManager,
        })
      );
    const mockedExecSync = jest
      .spyOn(childProcess, "execSync")
      .mockReturnValue("installed");

    await migrate(root, {
      force: false,
      dryRun: false,
      print: false,
      install: true,
    });

    expect(readJson("package.json")).toStrictEqual({
      dependencies: {},
      devDependencies: {
        nrz: "1.0.0",
      },
      name: "no-nrz-json",
      packageManager: "pnpm@1.2.3",
      version: "1.0.0",
    });
    expect(readJson("nrz.json")).toStrictEqual({
      $schema: "https://turbo.build/schema.json",
      pipeline: {
        build: {
          outputs: [".next/**", "!.next/cache/**"],
        },
        dev: {
          cache: false,
        },
        lint: {},
        test: {
          outputs: ["dist/**", "build/**"],
        },
      },
    });

    // verify mocks were called
    expect(mockedCheckGitStatus).toHaveBeenCalled();
    expect(mockedGetCurrentVersion).toHaveBeenCalled();
    expect(mockedGetLatestVersion).toHaveBeenCalled();
    expect(mockedGetNrzUpgradeCommand).toHaveBeenCalled();
    expect(mockedGetAvailablePackageManagers).toHaveBeenCalled();
    expect(mockedGetWorkspaceDetails).toHaveBeenCalled();
    expect(mockedExecSync).toHaveBeenCalled();
    expect(mockedExecSync).toHaveBeenNthCalledWith(1, "nrz bin", {
      cwd: root,
      stdio: "ignore",
    });
    expect(mockedExecSync).toHaveBeenNthCalledWith(2, "nrz daemon stop", {
      cwd: root,
      stdio: "ignore",
    });
    expect(mockedExecSync).toHaveBeenNthCalledWith(
      3,
      "pnpm install -g nrz@1.7.0",
      {
        cwd: root,
        stdio: "pipe",
      }
    );

    // restore mocks
    mockedCheckGitStatus.mockRestore();
    mockedGetCurrentVersion.mockRestore();
    mockedGetLatestVersion.mockRestore();
    mockedGetNrzUpgradeCommand.mockRestore();
    mockedGetAvailablePackageManagers.mockRestore();
    mockedGetWorkspaceDetails.mockRestore();
    mockedExecSync.mockRestore();
  });

  it("fails gracefully when the correct upgrade command cannot be found", async () => {
    const { root, readJson } = useFixture({
      fixture: "old-nrz",
    });

    const packageManager = "pnpm";
    const packageManagerVersion = "1.2.3";

    // setup mocks
    const mockedCheckGitStatus = jest
      .spyOn(checkGitStatus, "checkGitStatus")
      .mockReturnValue(undefined);
    const mockedGetCurrentVersion = jest
      .spyOn(getCurrentVersion, "getCurrentVersion")
      .mockReturnValue("1.0.0");
    const mockedGetLatestVersion = jest
      .spyOn(getLatestVersion, "getLatestVersion")
      .mockResolvedValue("1.7.0");
    const mockedGetNrzUpgradeCommand = jest
      .spyOn(getNrzUpgradeCommand, "getNrzUpgradeCommand")
      .mockResolvedValue(undefined);
    const mockedGetAvailablePackageManagers = jest
      .spyOn(nrzUtils, "getAvailablePackageManagers")
      .mockResolvedValue({
        pnpm: packageManagerVersion,
        npm: undefined,
        yarn: undefined,
        bun: undefined,
      });
    const mockedGetWorkspaceDetails = jest
      .spyOn(nrzWorkspaces, "getWorkspaceDetails")
      .mockResolvedValue(
        getWorkspaceDetailsMockReturnValue({
          root,
          packageManager,
        })
      );
    const mockedExecSync = jest
      .spyOn(childProcess, "execSync")
      .mockReturnValue("installed");

    await migrate(root, {
      force: false,
      dryRun: false,
      print: false,
      install: true,
    });

    expect(readJson("package.json")).toStrictEqual({
      dependencies: {},
      devDependencies: {
        nrz: "1.0.0",
      },
      name: "no-nrz-json",
      packageManager: "pnpm@1.2.3",
      version: "1.0.0",
    });
    expect(readJson("nrz.json")).toStrictEqual({
      $schema: "https://turbo.build/schema.json",
      pipeline: {
        build: {
          outputs: [".next/**", "!.next/cache/**"],
        },
        dev: {
          cache: false,
        },
        lint: {},
        test: {
          outputs: ["dist/**", "build/**"],
        },
      },
    });

    expect(mockExit.exit).toHaveBeenCalledWith(1);

    // verify mocks were called
    expect(mockedCheckGitStatus).toHaveBeenCalled();
    expect(mockedGetCurrentVersion).toHaveBeenCalled();
    expect(mockedGetLatestVersion).toHaveBeenCalled();
    expect(mockedGetNrzUpgradeCommand).toHaveBeenCalled();
    expect(mockedGetAvailablePackageManagers).toHaveBeenCalled();
    expect(mockedGetWorkspaceDetails).toHaveBeenCalled();
    expect(mockedExecSync).toHaveBeenCalledTimes(2);
    expect(mockedExecSync).toHaveBeenNthCalledWith(1, "nrz bin", {
      cwd: root,
      stdio: "ignore",
    });
    expect(mockedExecSync).toHaveBeenNthCalledWith(2, "nrz daemon stop", {
      cwd: root,
      stdio: "ignore",
    });

    // restore mocks
    mockedCheckGitStatus.mockRestore();
    mockedGetCurrentVersion.mockRestore();
    mockedGetLatestVersion.mockRestore();
    mockedGetNrzUpgradeCommand.mockRestore();
    mockedGetAvailablePackageManagers.mockRestore();
    mockedGetWorkspaceDetails.mockRestore();
    mockedExecSync.mockRestore();
  });

  it("exits if current version is not passed and cannot be inferred", async () => {
    const { root } = useFixture({
      fixture: "old-nrz",
    });

    const packageManager = "pnpm";

    // setup mocks
    const mockedCheckGitStatus = jest
      .spyOn(checkGitStatus, "checkGitStatus")
      .mockReturnValue(undefined);
    const mockedGetCurrentVersion = jest
      .spyOn(getCurrentVersion, "getCurrentVersion")
      .mockReturnValue(undefined);
    const mockedGetWorkspaceDetails = jest
      .spyOn(nrzWorkspaces, "getWorkspaceDetails")
      .mockResolvedValue(
        getWorkspaceDetailsMockReturnValue({
          root,
          packageManager,
        })
      );

    await migrate(root, {
      force: false,
      dryRun: false,
      print: false,
      install: false,
    });

    expect(mockExit.exit).toHaveBeenCalledWith(1);

    // verify mocks were called
    expect(mockedCheckGitStatus).toHaveBeenCalled();
    expect(mockedGetCurrentVersion).toHaveBeenCalled();
    expect(mockedGetWorkspaceDetails).toHaveBeenCalled();

    // restore mocks
    mockedCheckGitStatus.mockRestore();
    mockedGetCurrentVersion.mockRestore();
    mockedGetWorkspaceDetails.mockRestore();
  });

  it("exits if latest version is not passed and cannot be inferred", async () => {
    const { root } = useFixture({
      fixture: "old-nrz",
    });

    const packageManager = "npm";

    // setup mocks
    const mockedCheckGitStatus = jest
      .spyOn(checkGitStatus, "checkGitStatus")
      .mockReturnValue(undefined);
    const mockedGetCurrentVersion = jest
      .spyOn(getCurrentVersion, "getCurrentVersion")
      .mockReturnValue("1.5.0");
    const mockedGetLatestVersion = jest
      .spyOn(getLatestVersion, "getLatestVersion")
      .mockResolvedValue(undefined);
    const mockedGetWorkspaceDetails = jest
      .spyOn(nrzWorkspaces, "getWorkspaceDetails")
      .mockResolvedValue(
        getWorkspaceDetailsMockReturnValue({
          root,
          packageManager,
        })
      );

    await migrate(root, {
      force: false,
      dryRun: false,
      print: false,
      install: false,
    });

    expect(mockExit.exit).toHaveBeenCalledWith(1);

    // verify mocks were called
    expect(mockedCheckGitStatus).toHaveBeenCalled();
    expect(mockedGetCurrentVersion).toHaveBeenCalled();
    expect(mockedGetLatestVersion).toHaveBeenCalled();
    expect(mockedGetWorkspaceDetails).toHaveBeenCalled();

    // restore mocks
    mockedCheckGitStatus.mockRestore();
    mockedGetCurrentVersion.mockRestore();
    mockedGetLatestVersion.mockRestore();
    mockedGetWorkspaceDetails.mockRestore();
  });

  it("exits if latest version throws", async () => {
    const { root } = useFixture({
      fixture: "old-nrz",
    });

    const packageManager = "yarn";
    // setup mocks
    const mockedCheckGitStatus = jest
      .spyOn(checkGitStatus, "checkGitStatus")
      .mockReturnValue(undefined);
    const mockedGetCurrentVersion = jest
      .spyOn(getCurrentVersion, "getCurrentVersion")
      .mockReturnValue("1.5.0");
    const mockedGetLatestVersion = jest
      .spyOn(getLatestVersion, "getLatestVersion")
      .mockRejectedValue(new Error("failed to fetch version"));
    const mockedGetWorkspaceDetails = jest
      .spyOn(nrzWorkspaces, "getWorkspaceDetails")
      .mockResolvedValue(
        getWorkspaceDetailsMockReturnValue({
          root,
          packageManager,
        })
      );

    await migrate(root, {
      force: false,
      dryRun: false,
      print: false,
      install: false,
    });

    expect(mockExit.exit).toHaveBeenCalledWith(1);

    // verify mocks were called
    expect(mockedCheckGitStatus).toHaveBeenCalled();
    expect(mockedGetCurrentVersion).toHaveBeenCalled();
    expect(mockedGetLatestVersion).toHaveBeenCalled();
    expect(mockedGetWorkspaceDetails).toHaveBeenCalled();

    // restore mocks
    mockedCheckGitStatus.mockRestore();
    mockedGetCurrentVersion.mockRestore();
    mockedGetLatestVersion.mockRestore();
    mockedGetWorkspaceDetails.mockRestore();
  });

  it("exits if any transforms encounter an error", async () => {
    const { root } = useFixture({
      fixture: "old-nrz",
    });

    const packageManager = "pnpm";
    const packageManagerVersion = "1.2.3";

    // setup mocks
    const mockedCheckGitStatus = jest
      .spyOn(checkGitStatus, "checkGitStatus")
      .mockReturnValue(undefined);
    const mockedGetCurrentVersion = jest
      .spyOn(getCurrentVersion, "getCurrentVersion")
      .mockReturnValue("1.0.0");
    const mockedGetLatestVersion = jest
      .spyOn(getLatestVersion, "getLatestVersion")
      .mockResolvedValue("1.7.0");
    const mockedGetAvailablePackageManagers = jest
      .spyOn(nrzUtils, "getAvailablePackageManagers")
      .mockResolvedValue({
        pnpm: packageManagerVersion,
        npm: undefined,
        yarn: undefined,
        bun: undefined,
      });
    const mockedGetWorkspaceDetails = jest
      .spyOn(nrzWorkspaces, "getWorkspaceDetails")
      .mockResolvedValue(
        getWorkspaceDetailsMockReturnValue({
          root,
          packageManager,
        })
      );

    await migrate(root, {
      force: false,
      dryRun: true,
      print: false,
      install: true,
    });

    expect(mockExit.exit).toHaveBeenCalledWith(1);

    // verify mocks were called
    expect(mockedCheckGitStatus).not.toHaveBeenCalled();
    expect(mockedGetCurrentVersion).toHaveBeenCalled();
    expect(mockedGetLatestVersion).toHaveBeenCalled();
    expect(mockedGetAvailablePackageManagers).toHaveBeenCalled();
    expect(mockedGetWorkspaceDetails).toHaveBeenCalled();

    // restore mocks
    mockedCheckGitStatus.mockRestore();
    mockedGetCurrentVersion.mockRestore();
    mockedGetLatestVersion.mockRestore();
    mockedGetAvailablePackageManagers.mockRestore();
    mockedGetWorkspaceDetails.mockRestore();
  });

  it("exits if invalid directory is passed", async () => {
    useFixture({
      fixture: "old-nrz",
    });

    // setup mocks
    const mockedCheckGitStatus = jest
      .spyOn(checkGitStatus, "checkGitStatus")
      .mockReturnValue(undefined);

    await migrate("~/path/that/does/not/exist", {
      force: false,
      dryRun: false,
      print: false,
      install: false,
    });

    expect(mockExit.exit).toHaveBeenCalledWith(1);

    // verify mocks were called
    expect(mockedCheckGitStatus).toHaveBeenCalled();

    // restore mocks
    mockedCheckGitStatus.mockRestore();
  });

  it("exits if directory with no repo is passed", async () => {
    const { root } = useFixture({
      fixture: "no-repo",
    });

    // setup mocks
    const mockedCheckGitStatus = jest
      .spyOn(checkGitStatus, "checkGitStatus")
      .mockReturnValue(undefined);

    await migrate(root, {
      force: false,
      dryRun: false,
      print: false,
      install: false,
    });

    expect(mockExit.exit).toHaveBeenCalledWith(1);

    // verify mocks were called
    expect(mockedCheckGitStatus).toHaveBeenCalled();

    // restore mocks
    mockedCheckGitStatus.mockRestore();
  });

  it("migrates across majors with all required codemods", async () => {
    const { root, readJson } = useFixture({
      fixture: "nrz-1",
    });

    const packageManager = "pnpm";
    const packageManagerVersion = "1.2.3";

    // setup mocks
    const mockedCheckGitStatus = jest
      .spyOn(checkGitStatus, "checkGitStatus")
      .mockReturnValue(undefined);
    const mockedGetCurrentVersion = jest
      .spyOn(getCurrentVersion, "getCurrentVersion")
      .mockReturnValue("1.99.99");
    const mockedGetLatestVersion = jest
      .spyOn(getLatestVersion, "getLatestVersion")
      .mockResolvedValue("2.0.0");
    const mockedGetNrzUpgradeCommand = jest
      .spyOn(getNrzUpgradeCommand, "getNrzUpgradeCommand")
      .mockResolvedValue("pnpm install -g nrz@latest");
    const mockedGetAvailablePackageManagers = jest
      .spyOn(nrzUtils, "getAvailablePackageManagers")
      .mockResolvedValue({
        pnpm: packageManagerVersion,
        npm: undefined,
        yarn: undefined,
        bun: undefined,
      });
    const mockedGetWorkspaceDetails = jest
      .spyOn(nrzWorkspaces, "getWorkspaceDetails")
      .mockResolvedValue(
        getWorkspaceDetailsMockReturnValue({
          root,
          packageManager,
        })
      );

    await migrate(root, {
      force: false,
      dryRun: false,
      print: false,
      install: false,
    });

    expect(readJson("package.json")).toStrictEqual({
      dependencies: {},
      devDependencies: {
        nrz: "1.7.1",
      },
      name: "nrz-1",
      packageManager: "pnpm@1.2.3",
      version: "1.0.0",
    });
    expect(readJson("nrz.json")).toStrictEqual({
      $schema: "https://turbo.build/schema.json",
      tasks: {
        build: {
          outputs: [".next/**", "!.next/cache/**"],
        },
        dev: {
          cache: false,
        },
        lint: {
          inputs: ["$NRZ_DEFAULT$", ".env.local"],
          outputs: [],
        },
        test: {
          outputLogs: "errors-only",
        },
      },
    });

    // verify mocks were called
    expect(mockedCheckGitStatus).toHaveBeenCalled();
    expect(mockedGetCurrentVersion).toHaveBeenCalled();
    expect(mockedGetLatestVersion).toHaveBeenCalled();
    expect(mockedGetNrzUpgradeCommand).toHaveBeenCalled();
    expect(mockedGetAvailablePackageManagers).toHaveBeenCalled();
    expect(mockedGetWorkspaceDetails).toHaveBeenCalled();

    // restore mocks
    mockedCheckGitStatus.mockRestore();
    mockedGetCurrentVersion.mockRestore();
    mockedGetLatestVersion.mockRestore();
    mockedGetNrzUpgradeCommand.mockRestore();
    mockedGetAvailablePackageManagers.mockRestore();
    mockedGetWorkspaceDetails.mockRestore();
  }, 10000);
});
