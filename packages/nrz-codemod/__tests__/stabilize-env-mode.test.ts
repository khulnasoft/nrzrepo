import { setupTestFixtures } from "@nrz/test-utils";
import { describe, it, expect } from "@jest/globals";
import { transformer } from "../src/transforms/stabilize-env-mode";

describe("stabilize-env-mode", () => {
  const { useFixture } = setupTestFixtures({
    directory: __dirname,
    test: "stabilize-env-mode",
  });

  it("migrates env-mode has-both", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "has-both",
    });

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dryRun: false, print: false },
    });

    expect(JSON.parse(read("nrz.json") || "{}")).toStrictEqual({
      $schema: "https://turbo.build/schema.json",
      globalPassThroughEnv: [
        "EXPERIMENTAL_GLOBAL_PASSTHROUGH",
        "GLOBAL_PASSTHROUGH",
      ],
      pipeline: {
        build: {
          passThroughEnv: ["EXPERIMENTAL_TASK_PASSTHROUGH", "TASK_PASSTHROUGH"],
        },
      },
    });

    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      {
        "nrz.json": {
          "action": "modified",
          "additions": 2,
          "deletions": 4,
        },
      }
    `);
  });

  it("migrates env-mode has-duplicates", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "has-duplicates",
    });

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dryRun: false, print: false },
    });

    expect(JSON.parse(read("nrz.json") || "{}")).toStrictEqual({
      $schema: "https://turbo.build/schema.json",
      globalPassThroughEnv: [
        "DUPLICATE_GLOBAL",
        "EXPERIMENTAL_GLOBAL_PASSTHROUGH",
        "GLOBAL_PASSTHROUGH",
      ],
      pipeline: {
        build: {
          passThroughEnv: [
            "DUPLICATE_TASK",
            "EXPERIMENTAL_TASK_PASSTHROUGH",
            "TASK_PASSTHROUGH",
          ],
        },
      },
    });

    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      {
        "nrz.json": {
          "action": "modified",
          "additions": 2,
          "deletions": 6,
        },
      }
    `);
  });

  it("migrates env-mode has-empty", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "has-empty",
    });

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dryRun: false, print: false },
    });

    expect(JSON.parse(read("nrz.json") || "{}")).toStrictEqual({
      $schema: "https://turbo.build/schema.json",
      globalPassThroughEnv: [],
      pipeline: {
        build: {
          passThroughEnv: [],
        },
      },
    });

    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      {
        "nrz.json": {
          "action": "modified",
          "additions": 2,
          "deletions": 2,
        },
      }
    `);
  });

  it("migrates env-mode has-neither", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "has-neither",
    });

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dryRun: false, print: false },
    });

    expect(JSON.parse(read("nrz.json") || "{}")).toStrictEqual({
      $schema: "https://turbo.build/schema.json",
      pipeline: {
        build: {},
      },
    });

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

  it("migrates env-mode has-new", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "has-new",
    });

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dryRun: false, print: false },
    });

    expect(JSON.parse(read("nrz.json") || "{}")).toStrictEqual({
      $schema: "https://turbo.build/schema.json",
      globalPassThroughEnv: ["GLOBAL_PASSTHROUGH"],
      pipeline: {
        build: {
          passThroughEnv: ["TASK_PASSTHROUGH"],
        },
      },
    });

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

  it("migrates env-mode has-old", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "has-old",
    });

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dryRun: false, print: false },
    });

    expect(JSON.parse(read("nrz.json") || "{}")).toStrictEqual({
      $schema: "https://turbo.build/schema.json",
      globalPassThroughEnv: ["GLOBAL_PASSTHROUGH"],
      pipeline: {
        build: {
          passThroughEnv: ["TASK_PASSTHROUGH"],
        },
      },
    });

    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      {
        "nrz.json": {
          "action": "modified",
          "additions": 2,
          "deletions": 2,
        },
      }
    `);
  });

  it("migrates env-mode workspace-configs", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "workspace-configs",
    });

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dryRun: false, print: false },
    });

    expect(JSON.parse(read("nrz.json") || "{}")).toStrictEqual({
      $schema: "https://turbo.build/schema.json",
      globalPassThroughEnv: [
        "EXPERIMENTAL_GLOBAL_PASSTHROUGH",
        "GLOBAL_PASSTHROUGH",
      ],
      pipeline: {
        build: {
          passThroughEnv: ["EXPERIMENTAL_TASK_PASSTHROUGH", "TASK_PASSTHROUGH"],
        },
      },
    });

    expect(JSON.parse(read("apps/docs/nrz.json") || "{}")).toStrictEqual({
      extends: ["//"],
      pipeline: {
        build: {
          passThroughEnv: [
            "DOCS_TASK_PASSTHROUGH",
            "EXPERIMENTAL_DOCS_TASK_PASSTHROUGH",
          ],
        },
      },
    });

    expect(JSON.parse(read("apps/website/nrz.json") || "{}")).toStrictEqual({
      extends: ["//"],
      pipeline: {
        build: {
          passThroughEnv: [
            "EXPERIMENTAL_WEBSITE_TASK_PASSTHROUGH",
            "WEBSITE_TASK_PASSTHROUGH",
          ],
        },
      },
    });

    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      {
        "apps/docs/nrz.json": {
          "action": "modified",
          "additions": 1,
          "deletions": 1,
        },
        "apps/website/nrz.json": {
          "action": "modified",
          "additions": 1,
          "deletions": 2,
        },
        "nrz.json": {
          "action": "modified",
          "additions": 2,
          "deletions": 4,
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
