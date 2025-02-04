import { TelemetryConfig } from "./config";
import { type Args } from "./client";
import { CreateNrzTelemetry } from "./events/create-nrz";
import { NrzIgnoreTelemetry } from "./events/nrz-ignore";
import type { TelemetryClientClasses, PackageInfo } from "./events/types";

const telemetryClients: TelemetryClientClasses = {
  "create-nrz": CreateNrzTelemetry,
  "nrz-ignore": NrzIgnoreTelemetry,
};

const TELEMETRY_API = "https://telemetry.vercel.com";

export async function initTelemetry<T extends keyof TelemetryClientClasses>({
  packageInfo,
  opts,
}: {
  packageInfo: PackageInfo;
  opts?: Args["opts"];
}): Promise<{
  telemetry: InstanceType<TelemetryClientClasses[T]> | undefined;
}> {
  // lookup the correct client
  const Client = telemetryClients[packageInfo.name];

  // read the config
  const config = await TelemetryConfig.fromDefaultConfig();
  if (config) {
    config.showAlert();
    // initialize the given client
    const telemetry = new Client({
      api: TELEMETRY_API,
      packageInfo,
      config,
      opts,
    });

    return { telemetry } as {
      telemetry: InstanceType<TelemetryClientClasses[T]>;
    };
  }

  return { telemetry: undefined };
}
