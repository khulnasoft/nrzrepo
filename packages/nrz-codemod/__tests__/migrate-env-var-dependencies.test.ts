import merge from "deepmerge";
import type { SchemaV1, SchemaV2 } from "@nrz/types";
import { setupTestFixtures } from "@nrz/test-utils";
import { describe, it, expect } from "@jest/globals";
import {
  hasLegacyEnvVarDependencies,
  migratePipeline,
  migrateConfig,
  transformer,
} from "../src/transforms/migrate-env-var-dependencies";

const getTestNrzConfig = (
  override: SchemaV1 = { pipeline: {} }
): SchemaV1 => {
  const config = {
    $schema: "./docs/public/schema.json",
    globalDependencies: ["$GLOBAL_ENV_KEY"],
    pipeline: {
      test: {
        outputs: ["coverage/**/*"],
        dependsOn: ["^build"],
      },
      lint: {
        outputs: [],
      },
      dev: {
        cache: false,
      },
      build: {
        outputs: ["dist/**/*", ".next/**/*", "!.next/cache/**"],
        dependsOn: ["^build", "$TASK_ENV_KEY", "$ANOTHER_ENV_KEY"],
      },
    },
  };

  return merge(config, override, {
    arrayMerge: (_: unknown, sourceArray: Array<unknown>) => sourceArray,
  });
};

describe("migrate-env-var-dependencies", () => {
  describe("hasLegacyEnvVarDependencies - utility", () => {
    it("finds env keys in legacy nrz.json - has keys", () => {
      const config = getTestNrzConfig();
      const { hasKeys, envVars } = hasLegacyEnvVarDependencies(config);
      expect(hasKeys).toEqual(true);
      expect(envVars).toMatchInlineSnapshot(`
        [
          "$GLOBAL_ENV_KEY",
          "$TASK_ENV_KEY",
          "$ANOTHER_ENV_KEY",
        ]
      `);
    });

    it("finds env keys in legacy nrz.json - multiple pipeline keys", () => {
      const config = getTestNrzConfig({
        pipeline: { test: { dependsOn: ["$MY_ENV"] } },
      });
      const { hasKeys, envVars } = hasLegacyEnvVarDependencies(config);
      expect(hasKeys).toEqual(true);
      expect(envVars).toMatchInlineSnapshot(`
        [
          "$GLOBAL_ENV_KEY",
          "$MY_ENV",
          "$TASK_ENV_KEY",
          "$ANOTHER_ENV_KEY",
        ]
      `);
    });

    it("finds env keys in legacy nrz.json - no keys", () => {
      // override to exclude keys
      const config = getTestNrzConfig({
        globalDependencies: [],
        pipeline: { build: { dependsOn: [] } },
      });
      const { hasKeys, envVars } = hasLegacyEnvVarDependencies(config);
      expect(hasKeys).toEqual(false);
      expect(envVars).toMatchInlineSnapshot(`[]`);
    });

    it("finds env keys in nrz.json - no global", () => {
      const { hasKeys, envVars } = hasLegacyEnvVarDependencies({
        pipeline: { build: { dependsOn: ["$cool"] } },
      });
      expect(hasKeys).toEqual(true);
      expect(envVars).toMatchInlineSnapshot(`
        [
          "$cool",
        ]
      `);
    });
  });

  describe("migratePipeline - utility", () => {
    it("migrates pipeline with env var dependencies", () => {
      const config = getTestNrzConfig();
      const { build } = config.pipeline;
      const pipeline = migratePipeline(build);
      expect(pipeline).toHaveProperty("env");
      expect(pipeline.env).toMatchInlineSnapshot(`
        [
          "TASK_ENV_KEY",
          "ANOTHER_ENV_KEY",
        ]
      `);
      expect(pipeline.dependsOn).toMatchInlineSnapshot(`
        [
          "^build",
        ]
      `);
    });

    it("migrates pipeline with no env var dependencies", () => {
      const config = getTestNrzConfig();
      const { test } = config.pipeline;
      const pipeline = migratePipeline(test);
      expect(pipeline.env).toBeUndefined();
      expect(pipeline.dependsOn).toMatchInlineSnapshot(`
        [
          "^build",
        ]
      `);
    });

    it("migrates pipeline with existing env key", () => {
      const config = getTestNrzConfig({
        pipeline: { test: { env: ["$MY_ENV"], dependsOn: ["^build"] } },
      });
      const { test } = config.pipeline;
      const pipeline = migratePipeline(test);
      expect(pipeline).toHaveProperty("env");
      expect(pipeline.env).toMatchInlineSnapshot(`
        [
          "$MY_ENV",
        ]
      `);
      expect(pipeline.dependsOn).toMatchInlineSnapshot(`
        [
          "^build",
        ]
      `);
    });

    it("migrates pipeline with incomplete env key", () => {
      const config = getTestNrzConfig({
        pipeline: {
          test: { env: ["$MY_ENV"], dependsOn: ["^build", "$SUPER_COOL"] },
        },
      });
      const { test } = config.pipeline;
      const pipeline = migratePipeline(test);
      expect(pipeline).toHaveProperty("env");
      expect(pipeline.env).toMatchInlineSnapshot(`
        [
          "$MY_ENV",
          "SUPER_COOL",
        ]
      `);
      expect(pipeline.dependsOn).toMatchInlineSnapshot(`
        [
          "^build",
        ]
      `);
    });

    it("migrates pipeline with duplicate env keys", () => {
      const config = getTestNrzConfig({
        pipeline: {
          test: { env: ["$MY_ENV"], dependsOn: ["^build", "$MY_ENV"] },
        },
      });
      const { test } = config.pipeline;
      const pipeline = migratePipeline(test);
      expect(pipeline).toHaveProperty("env");
      expect(pipeline.env).toMatchInlineSnapshot(`
        [
          "$MY_ENV",
          "MY_ENV",
        ]
      `);
      expect(pipeline.dependsOn).toMatchInlineSnapshot(`
        [
          "^build",
        ]
      `);
    });
  });

  describe("migrateConfig - utility", () => {
    it("migrates config with env var dependencies", () => {
      const config = getTestNrzConfig();
      const pipeline = migrateConfig(config);
      expect(pipeline).toMatchInlineSnapshot(`
        {
          "$schema": "./docs/public/schema.json",
          "globalEnv": [
            "GLOBAL_ENV_KEY",
          ],
          "pipeline": {
            "build": {
              "dependsOn": [
                "^build",
              ],
              "env": [
                "TASK_ENV_KEY",
                "ANOTHER_ENV_KEY",
              ],
              "outputs": [
                "dist/**/*",
                ".next/**/*",
                "!.next/cache/**",
              ],
            },
            "dev": {
              "cache": false,
            },
            "lint": {
              "outputs": [],
            },
            "test": {
              "dependsOn": [
                "^build",
              ],
              "outputs": [
                "coverage/**/*",
              ],
            },
          },
        }
      `);
    });

    it("migrates config with no env var dependencies", () => {
      const config = getTestNrzConfig({
        globalDependencies: [],
        pipeline: {
          build: { dependsOn: ["^build"] },
        },
      });
      const pipeline = migrateConfig(config);
      expect(pipeline).toMatchInlineSnapshot(`
        {
          "$schema": "./docs/public/schema.json",
          "pipeline": {
            "build": {
              "dependsOn": [
                "^build",
              ],
              "outputs": [
                "dist/**/*",
                ".next/**/*",
                "!.next/cache/**",
              ],
            },
            "dev": {
              "cache": false,
            },
            "lint": {
              "outputs": [],
            },
            "test": {
              "dependsOn": [
                "^build",
              ],
              "outputs": [
                "coverage/**/*",
              ],
            },
          },
        }
      `);
    });

    it("migrates config with inconsistent config", () => {
      const config = getTestNrzConfig({
        pipeline: {
          test: { env: ["$MY_ENV"], dependsOn: ["^build", "$SUPER_COOL"] },
        },
      });
      const pipeline = migrateConfig(config);
      expect(pipeline).toMatchInlineSnapshot(`
        {
          "$schema": "./docs/public/schema.json",
          "globalEnv": [
            "GLOBAL_ENV_KEY",
          ],
          "pipeline": {
            "build": {
              "dependsOn": [
                "^build",
              ],
              "env": [
                "TASK_ENV_KEY",
                "ANOTHER_ENV_KEY",
              ],
              "outputs": [
                "dist/**/*",
                ".next/**/*",
                "!.next/cache/**",
              ],
            },
            "dev": {
              "cache": false,
            },
            "lint": {
              "outputs": [],
            },
            "test": {
              "dependsOn": [
                "^build",
              ],
              "env": [
                "$MY_ENV",
                "SUPER_COOL",
              ],
              "outputs": [
                "coverage/**/*",
              ],
            },
          },
        }
      `);
    });

    it("migrates config with duplicate env keys", () => {
      const config = getTestNrzConfig({
        pipeline: {
          test: { env: ["$MY_ENV"], dependsOn: ["^build", "$MY_ENV"] },
        },
      });
      const pipeline = migrateConfig(config);
      expect(pipeline).toMatchInlineSnapshot(`
        {
          "$schema": "./docs/public/schema.json",
          "globalEnv": [
            "GLOBAL_ENV_KEY",
          ],
          "pipeline": {
            "build": {
              "dependsOn": [
                "^build",
              ],
              "env": [
                "TASK_ENV_KEY",
                "ANOTHER_ENV_KEY",
              ],
              "outputs": [
                "dist/**/*",
                ".next/**/*",
                "!.next/cache/**",
              ],
            },
            "dev": {
              "cache": false,
            },
            "lint": {
              "outputs": [],
            },
            "test": {
              "dependsOn": [
                "^build",
              ],
              "env": [
                "$MY_ENV",
                "MY_ENV",
              ],
              "outputs": [
                "coverage/**/*",
              ],
            },
          },
        }
      `);
    });
  });

  describe("transform", () => {
    const { useFixture } = setupTestFixtures({
      directory: __dirname,
      test: "migrate-env-var-dependencies",
    });

    it("migrates nrz.json env var dependencies - basic", () => {
      // load the fixture for the test
      const { root, read } = useFixture({
        fixture: "env-dependencies",
      });

      // run the transformer
      const result = transformer({
        root,
        options: { force: false, dryRun: false, print: false },
      });

      expect(JSON.parse(read("nrz.json") || "{}")).toStrictEqual({
        $schema: "https://turbo.build/schema.json",
        globalDependencies: [".env"],
        globalEnv: ["NEXT_PUBLIC_API_KEY", "STRIPE_API_KEY"],
        pipeline: {
          build: {
            dependsOn: ["^build"],
            env: ["PROD_API_KEY"],
            outputs: [".next/**", "!.next/cache/**"],
          },
          dev: {
            cache: false,
          },
          lint: {
            dependsOn: [],
            env: ["IS_CI"],
            outputs: [],
          },
          test: {
            dependsOn: ["test"],
            env: ["IS_CI"],
            outputs: [],
          },
        },
      });

      expect(result.fatalError).toBeUndefined();
      expect(result.changes).toMatchInlineSnapshot(`
        {
          "nrz.json": {
            "action": "modified",
            "additions": 4,
            "deletions": 4,
          },
        }
      `);
    });

    it("migrates nrz.json env var dependencies - workspace configs", () => {
      // load the fixture for the test
      const { root, readJson } = useFixture({
        fixture: "workspace-configs",
      });

      // run the transformer
      const result = transformer({
        root,
        options: { force: false, dryRun: false, print: false },
      });

      expect(readJson("nrz.json") || "{}").toStrictEqual({
        $schema: "https://turbo.build/schema.json",
        globalDependencies: [".env"],
        globalEnv: ["NEXT_PUBLIC_API_KEY", "STRIPE_API_KEY"],
        pipeline: {
          build: {
            dependsOn: ["^build"],
            env: ["PROD_API_KEY"],
            outputs: [".next/**", "!.next/cache/**"],
          },
          dev: {
            cache: false,
          },
          lint: {
            dependsOn: [],
            env: ["IS_TEST"],
            outputs: [],
          },
          test: {
            dependsOn: ["test"],
            env: ["IS_CI"],
            outputs: [],
          },
        },
      });

      expect(readJson("apps/web/nrz.json") || "{}").toStrictEqual({
        $schema: "https://turbo.build/schema.json",
        extends: ["//"],
        pipeline: {
          build: {
            // old
            dependsOn: ["build"],
            // new
            env: ["ENV_1", "ENV_2"],
          },
        },
      });

      expect(readJson("packages/ui/nrz.json") || "{}").toStrictEqual({
        $schema: "https://turbo.build/schema.json",
        extends: ["//"],
        pipeline: {
          build: {
            dependsOn: [],
            env: ["IS_SERVER"],
          },
        },
      });

      expect(result.fatalError).toBeUndefined();
      expect(result.changes).toMatchInlineSnapshot(`
        {
          "apps/web/nrz.json": {
            "action": "modified",
            "additions": 1,
            "deletions": 0,
          },
          "packages/ui/nrz.json": {
            "action": "modified",
            "additions": 1,
            "deletions": 1,
          },
          "nrz.json": {
            "action": "modified",
            "additions": 4,
            "deletions": 4,
          },
        }
      `);
    });

    it("migrates nrz.json env var dependencies - repeat run", () => {
      // load the fixture for the test
      const { root, read } = useFixture({
        fixture: "env-dependencies",
      });

      // run the transformer
      const result = transformer({
        root,
        options: { force: false, dryRun: false, print: false },
      });

      expect(JSON.parse(read("nrz.json") || "{}")).toStrictEqual({
        $schema: "https://turbo.build/schema.json",
        globalDependencies: [".env"],
        globalEnv: ["NEXT_PUBLIC_API_KEY", "STRIPE_API_KEY"],
        pipeline: {
          build: {
            dependsOn: ["^build"],
            env: ["PROD_API_KEY"],
            outputs: [".next/**", "!.next/cache/**"],
          },
          dev: {
            cache: false,
          },
          lint: {
            dependsOn: [],
            env: ["IS_CI"],
            outputs: [],
          },
          test: {
            dependsOn: ["test"],
            env: ["IS_CI"],
            outputs: [],
          },
        },
      });

      expect(result.fatalError).toBeUndefined();
      expect(result.changes).toMatchInlineSnapshot(`
        {
          "nrz.json": {
            "action": "modified",
            "additions": 4,
            "deletions": 4,
          },
        }
      `);

      // run the transformer
      const repeatResult = transformer({
        root,
        options: { force: false, dryRun: false, print: false },
      });

      expect(repeatResult.fatalError).toBeUndefined();
      expect(repeatResult.changes).toMatchInlineSnapshot(`
        {
          "nrz.json": {
            "action": "unchanged",
            "additions": 0,
            "deletions": 0,
          },
        }
      `);
    });

    it("migrates nrz.json env var dependencies - dry", () => {
      // load the fixture for the test
      const { root, read } = useFixture({
        fixture: "env-dependencies",
      });

      const nrzJson = JSON.parse(read("nrz.json") || "{}") as SchemaV2;

      // run the transformer
      const result = transformer({
        root,
        options: { force: false, dryRun: true, print: false },
      });

      // make sure it didn't change
      expect(JSON.parse(read("nrz.json") || "{}")).toEqual(nrzJson);

      expect(result.fatalError).toBeUndefined();
      expect(result.changes).toMatchInlineSnapshot(`
        {
          "nrz.json": {
            "action": "skipped",
            "additions": 4,
            "deletions": 4,
          },
        }
      `);
    });

    it("migrates nrz.json env var dependencies - print", () => {
      // load the fixture for the test
      const { root, read } = useFixture({
        fixture: "env-dependencies",
      });

      // run the transformer
      const result = transformer({
        root,
        options: { force: false, dryRun: false, print: true },
      });

      expect(JSON.parse(read("nrz.json") || "{}")).toStrictEqual({
        $schema: "https://turbo.build/schema.json",
        globalEnv: ["NEXT_PUBLIC_API_KEY", "STRIPE_API_KEY"],
        globalDependencies: [".env"],
        pipeline: {
          build: {
            dependsOn: ["^build"],
            env: ["PROD_API_KEY"],
            outputs: [".next/**", "!.next/cache/**"],
          },
          dev: {
            cache: false,
          },
          lint: {
            dependsOn: [],
            env: ["IS_CI"],
            outputs: [],
          },
          test: {
            dependsOn: ["test"],
            env: ["IS_CI"],
            outputs: [],
          },
        },
      });

      expect(result.fatalError).toBeUndefined();
      expect(result.changes).toMatchInlineSnapshot(`
        {
          "nrz.json": {
            "action": "modified",
            "additions": 4,
            "deletions": 4,
          },
        }
      `);
    });

    it("migrates nrz.json env var dependencies - dry & print", () => {
      // load the fixture for the test
      const { root, read } = useFixture({
        fixture: "env-dependencies",
      });

      const nrzJson = JSON.parse(read("nrz.json") || "{}") as SchemaV2;

      // run the transformer
      const result = transformer({
        root,
        options: { force: false, dryRun: true, print: true },
      });

      // make sure it didn't change
      expect(JSON.parse(read("nrz.json") || "{}")).toEqual(nrzJson);

      expect(result.fatalError).toBeUndefined();
      expect(result.changes).toMatchInlineSnapshot(`
        {
          "nrz.json": {
            "action": "skipped",
            "additions": 4,
            "deletions": 4,
          },
        }
      `);
    });

    it("does not change nrz.json if already migrated", () => {
      // load the fixture for the test
      const { root, read } = useFixture({
        fixture: "migrated-env-dependencies",
      });

      const nrzJson = JSON.parse(read("nrz.json") || "{}") as SchemaV2;

      // run the transformer
      const result = transformer({
        root,
        options: { force: false, dryRun: false, print: false },
      });

      expect(JSON.parse(read("nrz.json") || "{}")).toEqual(nrzJson);

      expect(result.fatalError).toBeUndefined();
      expect(result.changes).toMatchInlineSnapshot(`
        {
          "nrz.json": {
            "action": "unchanged",
            "additions": 0,
            "deletions": 0,
          },
        }
      `);
    });

    it("errors if no nrz.json can be found", () => {
      // load the fixture for the test
      const { root, read } = useFixture({
        fixture: "no-nrz-json",
      });

      expect(read("nrz.json")).toBeUndefined();

      // run the transformer
      const result = transformer({
        root,
        options: { force: false, dryRun: false, print: false },
      });

      expect(read("nrz.json")).toBeUndefined();
      expect(result.fatalError).toBeDefined();
      expect(result.fatalError?.message).toMatch(
        /No nrz\.json found at .*?\. Is the path correct\?/
      );
    });

    it("errors if package.json config exists and has not been migrated", () => {
      // load the fixture for the test
      const { root } = useFixture({
        fixture: "old-config",
      });

      // run the transformer
      const result = transformer({
        root,
        options: { force: false, dryRun: false, print: false },
      });

      expect(result.fatalError).toBeDefined();
      expect(result.fatalError?.message).toMatch(
        'nrz" key detected in package.json. Run `npx @nrz/codemod transform create-nrz-config` first'
      );
    });
  });
});
