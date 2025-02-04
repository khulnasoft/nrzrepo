import { setupTestFixtures } from "@nrz/test-utils";
import { type Schema } from "@nrz/types";
import { describe, it, expect } from "@jest/globals";
import { transformer } from "../src/transforms/migrate-dot-env";

describe("migrate-dot-env", () => {
  const { useFixture } = setupTestFixtures({
    directory: __dirname,
    test: "migrate-dot-env",
  });
  it("migrates nrz.json dot-env - basic", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "with-dot-env",
    });

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dryRun: false, print: false },
    });

    expect(JSON.parse(read("nrz.json") || "{}")).toStrictEqual({
      $schema: "https://turbo.build/schema.json",
      globalDependencies: [".env"],
      tasks: {
        "build-one": {
          inputs: ["$NRZ_DEFAULT$", "build-one/.env"],
        },
        "build-two": {
          inputs: ["build-two/main.js", "build-two/.env"],
        },
        "build-three": {},
      },
    });

    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      {
        "nrz.json": {
          "action": "modified",
          "additions": 3,
          "deletions": 3,
        },
      }
    `);
  });

  it("migrates nrz.json dot-env - workspace configs", () => {
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
      tasks: {
        "build-one": {
          inputs: ["$NRZ_DEFAULT$", "build-one/.env"],
        },
        "build-two": {
          inputs: ["build-two/**/*.ts", "build-two/.env"],
        },
        "build-three": {},
      },
    });

    expect(readJson("apps/docs/nrz.json") || "{}").toStrictEqual({
      $schema: "https://turbo.build/schema.json",
      extends: ["//"],
      tasks: {
        build: {},
      },
    });

    expect(readJson("apps/web/nrz.json") || "{}").toStrictEqual({
      $schema: "https://turbo.build/schema.json",
      extends: ["//"],
      tasks: {
        build: {
          inputs: ["src/**/*.ts", ".env"],
        },
      },
    });

    expect(readJson("packages/ui/nrz.json") || "{}").toStrictEqual({
      $schema: "https://turbo.build/schema.json",
      extends: ["//"],
      tasks: {
        "build-three": {
          inputs: ["$NRZ_DEFAULT$", ".env"],
        },
      },
    });

    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      {
        "apps/docs/nrz.json": {
          "action": "unchanged",
          "additions": 0,
          "deletions": 0,
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
          "deletions": 2,
        },
      }
    `);
  });

  it("migrates nrz.json dot-env - dry", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "with-dot-env",
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
          "additions": 3,
          "deletions": 3,
        },
      }
    `);
  });

  it("migrates nrz.json dot-env - print", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "with-dot-env",
    });

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dryRun: false, print: true },
    });

    expect(JSON.parse(read("nrz.json") || "{}")).toStrictEqual({
      $schema: "https://turbo.build/schema.json",
      globalDependencies: [".env"],
      tasks: {
        "build-one": {
          inputs: ["$NRZ_DEFAULT$", "build-one/.env"],
        },
        "build-three": {},
        "build-two": {
          inputs: ["build-two/main.js", "build-two/.env"],
        },
      },
    });

    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      {
        "nrz.json": {
          "action": "modified",
          "additions": 3,
          "deletions": 3,
        },
      }
    `);
  });

  it("migrates nrz.json dot-env - dry & print", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "with-dot-env",
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
          "additions": 3,
          "deletions": 3,
        },
      }
    `);
  });

  it("migrates nrz.json dot-env - config with no pipeline", () => {
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
      tasks: {},
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

  it("migrates nrz.json dot-env - config with no dot env", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "no-dot-env",
    });

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dryRun: false, print: false },
    });

    expect(JSON.parse(read("nrz.json") || "{}")).toStrictEqual({
      $schema: "https://turbo.build/schema.json",
      tasks: {
        "build-one": {
          dependsOn: ["build-two"],
        },
        "build-two": {
          cache: false,
        },
        "build-three": {
          persistent: true,
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
});
