// TODO: This type is not complete - it will be expanded as needed
export interface DryRun {
  id: string;
  version: string;
  nrzVersion: string;
  monorepo: boolean;
  packages?: Array<string>;
  frameworkInference: boolean;
}
