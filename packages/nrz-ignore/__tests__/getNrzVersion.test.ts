import { spyConsole } from "@nrz/test-utils";
import { describe, it, expect } from "@jest/globals";
import { getNrzVersion } from "../src/getNrzVersion";

describe("getWorkspace()", () => {
  const mockConsole = spyConsole();
  it("getNrzVersion returns nrzVersion from arg", () => {
    expect(
      getNrzVersion(
        {
          nrzVersion: "1.2.3",
        },
        "./__fixtures__/app"
      )
    ).toEqual("1.2.3");

    expect(mockConsole.log).toHaveBeenNthCalledWith(
      1,
      "≫  ",
      'Using nrz version "1.2.3" from arguments'
    );
  });

  it("getNrzVersion returns version from package.json", () => {
    expect(getNrzVersion({}, "./__fixtures__/nrz_in_deps")).toEqual("^99");
    expect(mockConsole.log).toHaveBeenCalledWith(
      "≫  ",
      'Inferred nrz version "^99" from "package.json"'
    );
  });

  it("getNrzVersion infers ^2 if tasks in nrz.json", () => {
    expect(getNrzVersion({}, "./__fixtures__/no_nrz_deps")).toEqual("^2");
    expect(mockConsole.log).toHaveBeenCalledWith(
      "≫  ",
      'Inferred nrz version ^2 based on "tasks" in "nrz.json"'
    );
  });

  it("getNrzVersion infers ^1 if pipeline in nrz.json", () => {
    expect(getNrzVersion({}, "./__fixtures__/no_nrz_deps_v1")).toEqual(
      "^1"
    );
    expect(mockConsole.log).toHaveBeenCalledWith(
      "≫  ",
      'Inferred nrz version ^1 based on "pipeline" in "nrz.json"'
    );
  });

  it("getNrzVersion return null if no nrz.json", () => {
    expect(getNrzVersion({}, "./__fixtures__/app")).toEqual(null);
    expect(mockConsole.error).toHaveBeenCalledWith(
      "≫  ",
      '"__fixtures__/app/nrz.json" could not be read. nrz-ignore nrz version inference failed'
    );
  });

  it("getNrzVersion return null if no package.json", () => {
    expect(getNrzVersion({}, "./__fixtures__/no-app")).toEqual(null);
    expect(mockConsole.error).toHaveBeenCalledWith(
      "≫  ",
      '"__fixtures__/no-app/package.json" could not be read. nrz-ignore nrz version inference failed'
    );
  });

  it("getNrzVersion return null if invalid JSON", () => {
    expect(getNrzVersion({}, "./__fixtures__/invalid_nrz_json")).toEqual(
      null
    );
  });
});
