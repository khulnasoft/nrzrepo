import * as nrzWorkspaces from "@nrz/workspaces";
import * as nrzUtils from "@nrz/utils";
import { setupTestFixtures } from "@nrz/test-utils";
import { describe, it, expect, jest } from "@jest/globals";
import { getNrzUpgradeCommand } from "../src/commands/migrate/steps/getNrzUpgradeCommand";
import * as utils from "../src/commands/migrate/utils";
import { getWorkspaceDetailsMockReturnValue } from "./test-utils";

jest.mock<typeof import("@nrz/workspaces")>("@nrz/workspaces", () => ({
  __esModule: true,
  ...jest.requireActual("@nrz/workspaces"),
}));

interface TestCase {
  version: string;
  packageManager: nrzUtils.PackageManager;
  packageManagerVersion: string;
  fixture: string;
  expected: string;
}

const LOCAL_INSTALL_COMMANDS: Array<TestCase> = [
  // npm - workspaces
  {
    version: "latest",
    packageManager: "npm",
    packageManagerVersion: "7.0.0",
    fixture: "normal-workspaces-dev-install",
    expected: "npm install nrz@latest --save-dev",
  },
  {
    version: "1.6.3",
    packageManager: "npm",
    packageManagerVersion: "7.0.0",
    fixture: "normal-workspaces-dev-install",
    expected: "npm install nrz@1.6.3 --save-dev",
  },
  {
    version: "canary",
    packageManager: "npm",
    packageManagerVersion: "7.0.0",
    fixture: "normal-workspaces-dev-install",
    expected: "npm install nrz@canary --save-dev",
  },
  {
    version: "latest",
    packageManager: "npm",
    packageManagerVersion: "7.0.0",
    fixture: "normal-workspaces",
    expected: "npm install nrz@latest",
  },
  // npm - single package
  {
    version: "latest",
    packageManager: "npm",
    packageManagerVersion: "7.0.0",
    fixture: "single-package-dev-install",
    expected: "npm install nrz@latest --save-dev",
  },
  {
    version: "latest",
    packageManager: "npm",
    packageManagerVersion: "7.0.0",
    fixture: "single-package",
    expected: "npm install nrz@latest",
  },
  // pnpm - workspaces
  {
    version: "latest",
    packageManager: "pnpm",
    packageManagerVersion: "7.0.0",
    fixture: "pnpm-workspaces-dev-install",
    expected: "pnpm add nrz@latest --save-dev -w",
  },
  {
    version: "1.6.3",
    packageManager: "pnpm",
    packageManagerVersion: "7.0.0",
    fixture: "pnpm-workspaces-dev-install",
    expected: "pnpm add nrz@1.6.3 --save-dev -w",
  },
  {
    version: "canary",
    packageManager: "pnpm",
    packageManagerVersion: "7.0.0",
    fixture: "pnpm-workspaces-dev-install",
    expected: "pnpm add nrz@canary --save-dev -w",
  },
  {
    version: "latest",
    packageManager: "pnpm",
    packageManagerVersion: "7.0.0",
    fixture: "pnpm-workspaces",
    expected: "pnpm add nrz@latest -w",
  },
  // pnpm - single package
  {
    version: "latest",
    packageManager: "pnpm",
    packageManagerVersion: "7.0.0",
    fixture: "single-package-dev-install",
    expected: "pnpm add nrz@latest --save-dev",
  },
  {
    version: "latest",
    packageManager: "pnpm",
    packageManagerVersion: "7.0.0",
    fixture: "single-package",
    expected: "pnpm add nrz@latest",
  },
  // yarn 1.x - workspaces
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "1.22.19",
    fixture: "normal-workspaces-dev-install",
    expected: "yarn add nrz@latest --dev -W",
  },
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "1.22.19",
    fixture: "normal-workspaces",
    expected: "yarn add nrz@latest -W",
  },
  {
    version: "1.6.3",
    packageManager: "yarn",
    packageManagerVersion: "1.22.19",
    fixture: "normal-workspaces-dev-install",
    expected: "yarn add nrz@1.6.3 --dev -W",
  },
  {
    version: "canary",
    packageManager: "yarn",
    packageManagerVersion: "1.22.19",
    fixture: "normal-workspaces-dev-install",
    expected: "yarn add nrz@canary --dev -W",
  },
  // yarn 1.x - single package
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "1.22.19",
    fixture: "single-package-dev-install",
    expected: "yarn add nrz@latest --dev",
  },
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "1.22.19",
    fixture: "single-package",
    expected: "yarn add nrz@latest",
  },
  // yarn 2.x - workspaces
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "2.3.4",
    fixture: "normal-workspaces-dev-install",
    expected: "yarn add nrz@latest --dev",
  },
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "2.3.4",
    fixture: "normal-workspaces",
    expected: "yarn add nrz@latest",
  },
  {
    version: "1.6.3",
    packageManager: "yarn",
    packageManagerVersion: "2.3.4",
    fixture: "normal-workspaces-dev-install",
    expected: "yarn add nrz@1.6.3 --dev",
  },
  {
    version: "canary",
    packageManager: "yarn",
    packageManagerVersion: "2.3.4",
    fixture: "normal-workspaces-dev-install",
    expected: "yarn add nrz@canary --dev",
  },
  // yarn 2.x - single package
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "2.3.4",
    fixture: "single-package-dev-install",
    expected: "yarn add nrz@latest --dev",
  },
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "2.3.4",
    fixture: "single-package",
    expected: "yarn add nrz@latest",
  },
  // yarn 3.x - workspaces
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "3.3.4",
    fixture: "normal-workspaces-dev-install",
    expected: "yarn add nrz@latest --dev",
  },
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "3.3.4",
    fixture: "normal-workspaces",
    expected: "yarn add nrz@latest",
  },
  {
    version: "1.6.3",
    packageManager: "yarn",
    packageManagerVersion: "3.3.4",
    fixture: "normal-workspaces-dev-install",
    expected: "yarn add nrz@1.6.3 --dev",
  },
  {
    version: "canary",
    packageManager: "yarn",
    packageManagerVersion: "3.3.4",
    fixture: "normal-workspaces-dev-install",
    expected: "yarn add nrz@canary --dev",
  },
  // yarn 3.x - single package
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "3.3.4",
    fixture: "single-package-dev-install",
    expected: "yarn add nrz@latest --dev",
  },
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "3.3.4",
    fixture: "single-package",
    expected: "yarn add nrz@latest",
  },
];

const GLOBAL_INSTALL_COMMANDS: Array<TestCase> = [
  // npm
  {
    version: "latest",
    packageManager: "npm",
    packageManagerVersion: "7.0.0",
    fixture: "normal-workspaces-dev-install",
    expected: "npm install nrz@latest --global",
  },
  {
    version: "1.6.3",
    packageManager: "npm",
    packageManagerVersion: "7.0.0",
    fixture: "normal-workspaces-dev-install",
    expected: "npm install nrz@1.6.3 --global",
  },
  {
    version: "latest",
    packageManager: "npm",
    packageManagerVersion: "7.0.0",
    fixture: "normal-workspaces",
    expected: "npm install nrz@latest --global",
  },
  {
    version: "latest",
    packageManager: "npm",
    packageManagerVersion: "7.0.0",
    fixture: "single-package",
    expected: "npm install nrz@latest --global",
  },
  {
    version: "latest",
    packageManager: "npm",
    packageManagerVersion: "7.0.0",
    fixture: "single-package-dev-install",
    expected: "npm install nrz@latest --global",
  },
  // pnpm
  {
    version: "latest",
    packageManager: "pnpm",
    packageManagerVersion: "7.0.0",
    fixture: "pnpm-workspaces-dev-install",
    expected: "pnpm add nrz@latest --global",
  },
  {
    version: "1.6.3",
    packageManager: "pnpm",
    packageManagerVersion: "7.0.0",
    fixture: "pnpm-workspaces-dev-install",
    expected: "pnpm add nrz@1.6.3 --global",
  },
  {
    version: "latest",
    packageManager: "pnpm",
    packageManagerVersion: "7.0.0",
    fixture: "pnpm-workspaces",
    expected: "pnpm add nrz@latest --global",
  },
  {
    version: "latest",
    packageManager: "pnpm",
    packageManagerVersion: "7.0.0",
    fixture: "single-package",
    expected: "pnpm add nrz@latest --global",
  },
  {
    version: "latest",
    packageManager: "pnpm",
    packageManagerVersion: "7.0.0",
    fixture: "single-package-dev-install",
    expected: "pnpm add nrz@latest --global",
  },
  // yarn 1.x
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "1.22.19",
    fixture: "normal-workspaces-dev-install",
    expected: "yarn global add nrz@latest",
  },
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "1.22.19",
    fixture: "normal-workspaces",
    expected: "yarn global add nrz@latest",
  },
  {
    version: "1.6.3",
    packageManager: "yarn",
    packageManagerVersion: "1.22.19",
    fixture: "normal-workspaces-dev-install",
    expected: "yarn global add nrz@1.6.3",
  },
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "1.22.19",
    fixture: "single-package",
    expected: "yarn global add nrz@latest",
  },
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "1.22.19",
    fixture: "single-package-dev-install",
    expected: "yarn global add nrz@latest",
  },
  // yarn 2.x
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "2.3.4",
    fixture: "normal-workspaces-dev-install",
    expected: "yarn global add nrz@latest",
  },
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "2.3.4",
    fixture: "normal-workspaces",
    expected: "yarn global add nrz@latest",
  },
  {
    version: "1.6.3",
    packageManager: "yarn",
    packageManagerVersion: "2.3.4",
    fixture: "normal-workspaces-dev-install",
    expected: "yarn global add nrz@1.6.3",
  },
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "2.3.4",
    fixture: "single-package",
    expected: "yarn global add nrz@latest",
  },
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "2.3.4",
    fixture: "single-package-dev-install",
    expected: "yarn global add nrz@latest",
  },
  // yarn 3.x
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "3.3.3",
    fixture: "normal-workspaces-dev-install",
    expected: "yarn global add nrz@latest",
  },
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "3.3.3",
    fixture: "normal-workspaces",
    expected: "yarn global add nrz@latest",
  },
  {
    version: "1.6.3",
    packageManager: "yarn",
    packageManagerVersion: "3.3.3",
    fixture: "normal-workspaces-dev-install",
    expected: "yarn global add nrz@1.6.3",
  },
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "3.3.4",
    fixture: "single-package",
    expected: "yarn global add nrz@latest",
  },
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "3.3.4",
    fixture: "single-package-dev-install",
    expected: "yarn global add nrz@latest",
  },
];

describe("get-nrz-upgrade-command", () => {
  const { useFixture } = setupTestFixtures({
    directory: __dirname,
    test: "get-nrz-upgrade-command",
  });

  it.each(LOCAL_INSTALL_COMMANDS)(
    "returns correct upgrade command for local install of nrz@$version using $packageManager@$packageManagerVersion (fixture: $fixture)",
    async ({
      version,
      packageManager,
      packageManagerVersion,
      fixture,
      expected,
    }) => {
      const { root } = useFixture({
        fixture,
      });

      const mockedExec = jest
        .spyOn(utils, "exec")
        .mockImplementation((command: string) => {
          // fail the check for global nrz
          if (command.includes("bin")) {
            return undefined;
          }
        });
      const mockGetPackageManagersBinPaths = jest
        .spyOn(nrzUtils, "getPackageManagersBinPaths")
        .mockResolvedValue({
          pnpm: undefined,
          npm: undefined,
          yarn: undefined,
          bun: undefined,
        });
      const mockGetAvailablePackageManagers = jest
        .spyOn(nrzUtils, "getAvailablePackageManagers")
        .mockResolvedValue({
          pnpm: packageManager === "pnpm" ? packageManagerVersion : undefined,
          npm: packageManager === "npm" ? packageManagerVersion : undefined,
          yarn: packageManager === "yarn" ? packageManagerVersion : undefined,
          bun: packageManager === "bun" ? packageManagerVersion : undefined,
        });

      const project = getWorkspaceDetailsMockReturnValue({
        root,
        packageManager,
        singlePackage: fixture.includes("single-package"),
      });
      const mockGetWorkspaceDetails = jest
        .spyOn(nrzWorkspaces, "getWorkspaceDetails")
        .mockResolvedValue(project);

      // get the command
      const upgradeCommand = await getNrzUpgradeCommand({
        project,
        to: version === "latest" ? undefined : version,
      });

      expect(upgradeCommand).toEqual(expected);

      mockedExec.mockRestore();
      mockGetPackageManagersBinPaths.mockRestore();
      mockGetAvailablePackageManagers.mockRestore();
      mockGetWorkspaceDetails.mockRestore();
    }
  );

  it.each(GLOBAL_INSTALL_COMMANDS)(
    "returns correct upgrade command for global install of nrz@$version using $packageManager@$packageManagerVersion (fixture: $fixture)",
    async ({
      version,
      packageManager,
      packageManagerVersion,
      fixture,
      expected,
    }) => {
      const { root } = useFixture({
        fixture,
      });

      const mockedExec = jest
        .spyOn(utils, "exec")
        .mockImplementation((command: string) => {
          if (command === "nrz bin") {
            return `/global/${packageManager}/bin/nrz`;
          }
          return undefined;
        });
      const mockGetPackageManagersBinPaths = jest
        .spyOn(nrzUtils, "getPackageManagersBinPaths")
        .mockResolvedValue({
          pnpm: `/global/pnpm/bin`,
          npm: `/global/npm/bin`,
          yarn: `/global/yarn/bin`,
          bun: `/global/bun/bin`,
        });

      const mockGetAvailablePackageManagers = jest
        .spyOn(nrzUtils, "getAvailablePackageManagers")
        .mockResolvedValue({
          pnpm: packageManager === "pnpm" ? packageManagerVersion : undefined,
          npm: packageManager === "npm" ? packageManagerVersion : undefined,
          yarn: packageManager === "yarn" ? packageManagerVersion : undefined,
          bun: packageManager === "bun" ? packageManagerVersion : undefined,
        });

      const project = getWorkspaceDetailsMockReturnValue({
        root,
        packageManager,
      });
      const mockGetWorkspaceDetails = jest
        .spyOn(nrzWorkspaces, "getWorkspaceDetails")
        .mockResolvedValue(project);

      // get the command
      const upgradeCommand = await getNrzUpgradeCommand({
        project,
        to: version === "latest" ? undefined : version,
      });

      expect(upgradeCommand).toEqual(expected);

      mockedExec.mockRestore();
      mockGetPackageManagersBinPaths.mockRestore();
      mockGetAvailablePackageManagers.mockRestore();
      mockGetWorkspaceDetails.mockRestore();
    }
  );

  describe("errors", () => {
    it("fails gracefully if no package.json exists", async () => {
      const { root } = useFixture({
        fixture: "no-package",
      });

      const mockedExec = jest
        .spyOn(utils, "exec")
        .mockImplementation((command: string) => {
          // fail the check for the nrz to force local
          if (command.includes("bin")) {
            return undefined;
          }
        });

      const mockGetAvailablePackageManagers = jest
        .spyOn(nrzUtils, "getAvailablePackageManagers")
        .mockResolvedValue({
          pnpm: "8.0.0",
          npm: undefined,
          yarn: undefined,
          bun: undefined,
        });

      const project = getWorkspaceDetailsMockReturnValue({
        root,
        packageManager: "pnpm",
      });
      const mockGetWorkspaceDetails = jest
        .spyOn(nrzWorkspaces, "getWorkspaceDetails")
        .mockResolvedValue(project);

      // get the command
      const upgradeCommand = await getNrzUpgradeCommand({
        project,
      });

      expect(upgradeCommand).toEqual(undefined);

      mockedExec.mockRestore();
      mockGetAvailablePackageManagers.mockRestore();
      mockGetWorkspaceDetails.mockRestore();
    }, 10000);

    it.each([
      {
        fixture: "no-package",
        name: "fails gracefully if no package.json exists",
      },
      {
        fixture: "no-nrz",
        name: "fails gracefully if nrz cannot be found in package.json",
      },
      {
        fixture: "no-deps",
        name: "fails gracefully if package.json has no deps or devDeps",
      },
    ])(
      "$name",
      async ({ fixture }) => {
        const { root } = useFixture({
          fixture,
        });

        const mockedExec = jest
          .spyOn(utils, "exec")
          .mockImplementation((command: string) => {
            // fail the check for the nrz to force local
            if (command.includes("bin")) {
              return undefined;
            }
          });

        const mockGetAvailablePackageManagers = jest
          .spyOn(nrzUtils, "getAvailablePackageManagers")
          .mockResolvedValue({
            pnpm: "8.0.0",
            npm: undefined,
            yarn: undefined,
            bun: undefined,
          });

        const project = getWorkspaceDetailsMockReturnValue({
          root,
          packageManager: "pnpm",
        });
        const mockGetWorkspaceDetails = jest
          .spyOn(nrzWorkspaces, "getWorkspaceDetails")
          .mockResolvedValue(project);

        // get the command
        const upgradeCommand = await getNrzUpgradeCommand({
          project,
        });

        expect(upgradeCommand).toEqual(undefined);

        mockedExec.mockRestore();
        mockGetAvailablePackageManagers.mockRestore();
        mockGetWorkspaceDetails.mockRestore();
      },
      10000
    );
  });
});
