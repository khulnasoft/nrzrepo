import type { PackageManager } from "@nrz/utils";
import type { ManagerHandler } from "../types";
import { pnpm } from "./pnpm";
import { npm } from "./npm";
import { yarn } from "./yarn";
import { bun } from "./bun";

export const MANAGERS: Record<PackageManager, ManagerHandler> = {
  pnpm,
  yarn,
  npm,
  bun,
};
