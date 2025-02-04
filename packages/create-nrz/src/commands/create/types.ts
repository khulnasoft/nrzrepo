import { type CreateNrzTelemetry } from "@nrz/telemetry";
import type { PackageManager } from "@nrz/utils";

export type CreateCommandArgument = string | undefined;

export interface CreateCommandOptions {
  packageManager?: PackageManager;
  skipInstall?: boolean;
  skipTransforms?: boolean;
  nrzVersion?: string;
  example?: string;
  examplePath?: string;
  telemetry: CreateNrzTelemetry | undefined;
}
