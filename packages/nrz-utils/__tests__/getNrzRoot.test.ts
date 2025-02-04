import path from "node:path";
import { setupTestFixtures } from "@nrz/test-utils";
import { describe, it, expect } from "@jest/globals";
import { getNrzRoot } from "../src/getNrzRoot";

describe("getNrzConfigs", () => {
  const { useFixture } = setupTestFixtures({
    directory: path.join(__dirname, "../"),
    test: "common",
  });

  it.each([[""], ["child"]])(
    "finds the root in a non-monorepo (%s)",
    (repoPath) => {
      const { root } = useFixture({ fixture: `single-package` });
      const nrzRoot = getNrzRoot(path.join(root, repoPath));
      expect(nrzRoot).toEqual(root);
    }
  );

  it.each([
    [""],
    ["apps"],
    ["apps/docs"],
    ["apps/web"],
    ["packages"],
    ["packages/ui"],
    ["not-a-real/path"],
  ])("finds the root in a monorepo with workspace configs (%s)", (repoPath) => {
    const { root } = useFixture({ fixture: `workspace-configs` });
    const nrzRoot = getNrzRoot(path.join(root, repoPath));
    expect(nrzRoot).toEqual(root);
  });
});
