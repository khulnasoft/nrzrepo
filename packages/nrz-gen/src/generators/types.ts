import type { Project } from "@nrz/workspaces";
import type { NrzGeneratorCLIOptions } from "../commands/workspace";
import type { CustomGeneratorCLIOptions } from "../commands/run";

export type WorkspaceType = "app" | "package";
export interface CopyData {
  type: "internal" | "external";
  source: string;
}

export type NrzGeneratorOptions = Omit<
  NrzGeneratorCLIOptions,
  "copy" | "empty"
> & {
  copy: CopyData;
  method: "copy" | "empty";
};

export interface NrzGeneratorArguments {
  project: Project;
  opts: NrzGeneratorOptions;
}

export interface CustomGeneratorArguments {
  generator: string | undefined;
  project: Project;
  opts: CustomGeneratorCLIOptions;
}
