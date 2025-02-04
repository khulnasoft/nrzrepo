import { type CreateNrzTelemetry } from "./create-nrz";
import { type NrzIgnoreTelemetry } from "./nrz-ignore";

export interface TelemetryClientClasses {
  "create-nrz": typeof CreateNrzTelemetry;
  "nrz-ignore": typeof NrzIgnoreTelemetry;
}

export interface PackageInfo {
  name: keyof TelemetryClientClasses;
  version: string;
}

export interface Event {
  id: string;
  key: string;
  value: string;
  package_name: string;
  package_version: string;
  parent_id: string | undefined;
}
