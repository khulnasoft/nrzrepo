import { setupTestFixtures } from "@nrz/test-utils";
import { describe, it, expect, jest } from "@jest/globals";
import fs from "fs-extra";
import { transformer } from "../src/transforms/create-nrz-config";

describe("create-nrz-config", () => {
  const { useFixture } = setupTestFixtures({
    directory: __dirname,
    test: "create-nrz-config",
  });

  it("package.json config exists but no nrz.json config - basic", () => {
    // load the fixture for the test
    const { root, read } = useFixture({ fixture: "no-nrz-json-config" });

    // nrz.json should not exist
    expect(read("nrz.json")).toBeUndefined();

    // get config from package.json for comparison later
    const nrzConfig = JSON.parse(read("package.json") || "{}").nrz;
    expect(nrzConfig).toBeDefined();
    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dryRun: false, print: false },
    });

    // nrz.json should now exist (and match the package.json config)
    expect(JSON.parse(read("nrz.json") || "{}")).toEqual(nrzConfig);

    // result should be correct
    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      {
        "package.json": {
          "action": "modified",
          "additions": 0,
          "deletions": 1,
        },
        "nrz.json": {
          "action": "modified",
          "additions": 1,
          "deletions": 0,
        },
      }
    `);
  });

  it("package.json config exists but no nrz.json config - repeat run", () => {
    // load the fixture for the test
    const { root, read } = useFixture({ fixture: "no-nrz-json-config" });

    // nrz.json should not exist
    expect(read("nrz.json")).toBeUndefined();

    // get config from package.json for comparison later
    const nrzConfig = JSON.parse(read("package.json") || "{}").nrz;
    expect(nrzConfig).toBeDefined();
    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dryRun: false, print: false },
    });

    // nrz.json should now exist (and match the package.json config)
    expect(JSON.parse(read("nrz.json") || "{}")).toEqual(nrzConfig);

    // result should be correct
    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      {
        "package.json": {
          "action": "modified",
          "additions": 0,
          "deletions": 1,
        },
        "nrz.json": {
          "action": "modified",
          "additions": 1,
          "deletions": 0,
        },
      }
    `);

    // run the transformer
    const repeatResult = transformer({
      root,
      options: { force: false, dryRun: false, print: false },
    });
    // result should be correct
    expect(repeatResult.fatalError).toBeUndefined();
    expect(repeatResult.changes).toMatchInlineSnapshot(`
      {
        "package.json": {
          "action": "unchanged",
          "additions": 0,
          "deletions": 0,
        },
        "nrz.json": {
          "action": "unchanged",
          "additions": 0,
          "deletions": 0,
        },
      }
    `);
  });

  it("package.json config exists but no nrz.json config - dry", () => {
    // load the fixture for the test
    const { root, read } = useFixture({ fixture: "no-nrz-json-config" });

    // nrz.json should not exist
    expect(read("nrz.json")).toBeUndefined();

    // get config from package.json for comparison later
    const nrzConfig = JSON.parse(read("package.json") || "{}").nrz;
    expect(nrzConfig).toBeDefined();
    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dryRun: true, print: false },
    });

    // nrz.json still not exist (dry run)
    expect(read("nrz.json")).toBeUndefined();

    // result should be correct
    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      {
        "package.json": {
          "action": "skipped",
          "additions": 0,
          "deletions": 1,
        },
        "nrz.json": {
          "action": "skipped",
          "additions": 1,
          "deletions": 0,
        },
      }
    `);
  });

  it("package.json config exists but no nrz.json config - print", () => {
    // load the fixture for the test
    const { root, read } = useFixture({ fixture: "no-nrz-json-config" });

    // nrz.json should not exist
    expect(read("nrz.json")).toBeUndefined();

    // get config from package.json for comparison later
    const nrzConfig = JSON.parse(read("package.json") || "{}").nrz;
    expect(nrzConfig).toBeDefined();
    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dryRun: false, print: true },
    });

    // nrz.json should now exist (and match the package.json config)
    expect(JSON.parse(read("nrz.json") || "{}")).toEqual(nrzConfig);

    // result should be correct
    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      {
        "package.json": {
          "action": "modified",
          "additions": 0,
          "deletions": 1,
        },
        "nrz.json": {
          "action": "modified",
          "additions": 1,
          "deletions": 0,
        },
      }
    `);
  });

  it("package.json config exists but no nrz.json config - dry & print", () => {
    // load the fixture for the test
    const { root, read } = useFixture({ fixture: "no-nrz-json-config" });

    // nrz.json should not exist
    expect(read("nrz.json")).toBeUndefined();

    // get config from package.json for comparison later
    const nrzConfig = JSON.parse(read("package.json") || "{}").nrz;
    expect(nrzConfig).toBeDefined();
    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dryRun: true, print: true },
    });

    // nrz.json still not exist (dry run)
    expect(read("nrz.json")).toBeUndefined();

    // result should be correct
    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      {
        "package.json": {
          "action": "skipped",
          "additions": 0,
          "deletions": 1,
        },
        "nrz.json": {
          "action": "skipped",
          "additions": 1,
          "deletions": 0,
        },
      }
    `);
  });

  it("no package.json config or nrz.json file exists", () => {
    // load the fixture for the test
    const { root, read } = useFixture({ fixture: "no-package-json-config" });

    // nrz.json should not exist
    expect(read("nrz.json")).toBeUndefined();

    // get config from package.json for comparison later
    const packageJsonConfig = JSON.parse(read("package.json") || "{}");
    const nrzConfig = packageJsonConfig.nrz;
    expect(nrzConfig).toBeUndefined();
    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dryRun: false, print: false },
    });

    // nrz.json should still not exist
    expect(read("nrz.json")).toBeUndefined();

    // make sure we didn't change the package.json
    expect(JSON.parse(read("package.json") || "{}")).toEqual(packageJsonConfig);

    // result should be correct
    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      {
        "package.json": {
          "action": "unchanged",
          "additions": 0,
          "deletions": 0,
        },
        "nrz.json": {
          "action": "unchanged",
          "additions": 0,
          "deletions": 0,
        },
      }
    `);
  });

  it("no package.json file exists", () => {
    // load the fixture for the test
    const { root, read } = useFixture({ fixture: "no-package-json-file" });

    // nrz.json should not exist
    expect(read("nrz.json")).toBeUndefined();

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dryRun: false, print: false },
    });

    // nrz.json should still not exist
    expect(read("nrz.json")).toBeUndefined();

    // result should be correct
    expect(result.fatalError?.message).toMatch(
      /No package\.json found at .*?\. Is the path correct\?/
    );
  });

  it("nrz.json file exists and no package.json config exists", () => {
    // load the fixture for the test
    const { root, read } = useFixture({ fixture: "nrz-json-config" });

    // nrz.json should exist
    expect(read("nrz.json")).toBeDefined();

    // no config should exist in package.json
    const packageJsonConfig = JSON.parse(read("package.json") || "{}");
    const nrzConfig = packageJsonConfig.nrz;
    expect(nrzConfig).toBeUndefined();

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dryRun: false, print: false },
    });

    // nrz.json should still exist
    expect(read("nrz.json")).toBeDefined();

    // make sure we didn't change the package.json
    expect(JSON.parse(read("package.json") || "{}")).toEqual(packageJsonConfig);

    // result should be correct
    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      {
        "package.json": {
          "action": "unchanged",
          "additions": 0,
          "deletions": 0,
        },
        "nrz.json": {
          "action": "unchanged",
          "additions": 0,
          "deletions": 0,
        },
      }
    `);
  });

  it("nrz.json file exists and package.json config exists", () => {
    // load the fixture for the test
    const { root, read } = useFixture({ fixture: "both-configs" });

    // nrz.json should exist
    const nrzJsonConfig = JSON.parse(read("nrz.json") || "{}");
    expect(nrzJsonConfig.pipeline).toBeDefined();

    // no config should exist in package.json
    const packageJsonConfig = JSON.parse(read("package.json") || "{}");
    const nrzConfig = JSON.parse(read("package.json") || "{}").nrz;
    expect(nrzConfig).toBeDefined();

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dryRun: false, print: false },
    });

    // make sure we didn't change the package.json
    expect(JSON.parse(read("package.json") || "{}")).toEqual(packageJsonConfig);

    // make sure we didn't change the nrz.json
    expect(JSON.parse(read("nrz.json") || "{}")).toEqual(nrzJsonConfig);

    // result should be correct
    expect(result.fatalError?.message).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      {
        "package.json": {
          "action": "unchanged",
          "additions": 0,
          "deletions": 0,
        },
        "nrz.json": {
          "action": "unchanged",
          "additions": 0,
          "deletions": 0,
        },
      }
    `);
  });

  it("errors when unable to write json", () => {
    // load the fixture for the test
    const { root, read } = useFixture({ fixture: "no-nrz-json-config" });

    // nrz.json should not exist
    expect(read("nrz.json")).toBeUndefined();

    // get config from package.json for comparison later
    const nrzConfig = JSON.parse(read("package.json") || "{}").nrz;
    expect(nrzConfig).toBeDefined();

    const mockWriteJsonSync = jest
      .spyOn(fs, "writeJsonSync")
      .mockImplementation(() => {
        throw new Error("could not write file");
      });

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dryRun: false, print: false },
    });

    // nrz.json should still not exist (error writing)
    expect(read("nrz.json")).toBeUndefined();

    // result should be correct
    expect(result.fatalError).toBeDefined();
    expect(result.fatalError?.message).toMatch(
      "Encountered an error while transforming files"
    );
    expect(result.changes).toMatchInlineSnapshot(`
      {
        "package.json": {
          "action": "error",
          "additions": 0,
          "deletions": 1,
          "error": [Error: could not write file],
        },
        "nrz.json": {
          "action": "error",
          "additions": 1,
          "deletions": 0,
          "error": [Error: could not write file],
        },
      }
    `);

    mockWriteJsonSync.mockRestore();
  });
});
