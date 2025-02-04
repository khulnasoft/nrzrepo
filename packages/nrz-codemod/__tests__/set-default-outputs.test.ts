import { setupTestFixtures } from "@nrz/test-utils";
import { type Schema } from "@nrz/types";
import { describe, it, expect } from "@jest/globals";
import { transformer } from "../src/transforms/set-default-outputs";

describe("set-default-outputs", () => {
  const { useFixture } = setupTestFixtures({
    directory: __dirname,
    test: "set-default-outputs",
  });
  it("migrates nrz.json outputs - basic", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "old-outputs",
    });

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dryRun: false, print: false },
    });

    expect(JSON.parse(read("nrz.json") || "{}")).toStrictEqual({
      $schema: "https://turbo.build/schema.json",
      pipeline: {
        "build-one": {
          outputs: ["foo"],
        },
        "build-two": {},
        "build-three": {
          outputs: ["dist/**", "build/**"],
        },
      },
    });

    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      {
        "nrz.json": {
          "action": "modified",
          "additions": 2,
          "deletions": 1,
        },
      }
    `);
  });

  it("migrates nrz.json outputs - workspace configs", () => {
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
      pipeline: {
        "build-one": {
          outputs: ["foo"],
        },
        "build-two": {},
        "build-three": {
          outputs: ["dist/**", "build/**"],
        },
      },
    });

    expect(readJson("apps/docs/nrz.json") || "{}").toStrictEqual({
      $schema: "https://turbo.build/schema.json",
      extends: ["//"],
      pipeline: {
        build: {
          outputs: ["dist/**", "build/**"],
        },
      },
    });

    expect(readJson("apps/web/nrz.json") || "{}").toStrictEqual({
      $schema: "https://turbo.build/schema.json",
      extends: ["//"],
      pipeline: {
        build: {},
      },
    });

    expect(readJson("packages/ui/nrz.json") || "{}").toStrictEqual({
      $schema: "https://turbo.build/schema.json",
      extends: ["//"],
      pipeline: {
        "build-three": {
          outputs: ["dist/**", "build/**"],
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
          "additions": 2,
          "deletions": 1,
        },
      }
    `);
  });

  it("migrates nrz.json outputs - dry", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "old-outputs",
    });

    const nrzJson = JSON.parse(read("nrz.json") || "{}") as Schema;

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
          "additions": 2,
          "deletions": 1,
        },
      }
    `);
  });

  it("migrates nrz.json outputs - print", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "old-outputs",
    });

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dryRun: false, print: true },
    });

    expect(JSON.parse(read("nrz.json") || "{}")).toStrictEqual({
      $schema: "https://turbo.build/schema.json",
      pipeline: {
        "build-one": {
          outputs: ["foo"],
        },
        "build-two": {},
        "build-three": {
          outputs: ["dist/**", "build/**"],
        },
      },
    });

    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      {
        "nrz.json": {
          "action": "modified",
          "additions": 2,
          "deletions": 1,
        },
      }
    `);
  });

  it("migrates nrz.json outputs - dry & print", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "old-outputs",
    });

    const nrzJson = JSON.parse(read("nrz.json") || "{}") as Schema;

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
          "additions": 2,
          "deletions": 1,
        },
      }
    `);
  });

  it("migrates nrz.json outputs - invalid", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "invalid-outputs",
    });

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dryRun: false, print: false },
    });

    expect(JSON.parse(read("nrz.json") || "{}")).toStrictEqual({
      $schema: "https://turbo.build/schema.json",
      pipeline: {
        "build-one": {
          outputs: ["foo"],
        },
        "build-two": {},
        "build-three": {
          outputs: ["dist/**", "build/**"],
        },
        "garbage-in-numeric-0": {
          outputs: ["dist/**", "build/**"],
        },
        "garbage-in-numeric": {
          outputs: 42,
        },
        "garbage-in-string": {
          outputs: "string",
        },
        "garbage-in-empty-string": {
          outputs: ["dist/**", "build/**"],
        },
        "garbage-in-null": {
          outputs: ["dist/**", "build/**"],
        },
        "garbage-in-false": {
          outputs: ["dist/**", "build/**"],
        },
        "garbage-in-true": {
          outputs: true,
        },
        "garbage-in-object": {
          outputs: {},
        },
      },
    });

    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      {
        "nrz.json": {
          "action": "modified",
          "additions": 6,
          "deletions": 5,
        },
      }
    `);
  });

  it("migrates nrz.json outputs - config with no pipeline", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "no-pipeline",
    });

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dryRun: false, print: false },
    });

    expect(JSON.parse(read("nrz.json") || "{}")).toStrictEqual({
      $schema: "https://turbo.build/schema.json",
      globalDependencies: ["$NEXT_PUBLIC_API_KEY", "$STRIPE_API_KEY", ".env"],
      pipeline: {},
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

  it("migrates nrz.json outputs - config with no outputs", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "no-outputs",
    });

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dryRun: false, print: false },
    });

    expect(JSON.parse(read("nrz.json") || "{}")).toStrictEqual({
      $schema: "https://turbo.build/schema.json",
      pipeline: {
        "build-one": {
          dependsOn: ["build-two"],
          outputs: ["dist/**", "build/**"],
        },
        "build-two": {
          cache: false,
        },
        "build-three": {
          persistent: true,
          outputs: ["dist/**", "build/**"],
        },
      },
    });

    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      {
        "nrz.json": {
          "action": "modified",
          "additions": 2,
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
