import type { Linter } from "eslint";
import { RULES } from "../constants";
import { Project } from "../utils/calculate-inputs";

const project = new Project(process.cwd());
const cacheKey = project.valid() ? project.key() : Math.random();

const settings = {
  nrz: {
    cacheKey,
  },
};

const config = {
  settings,
  plugins: ["nrz"],
  rules: {
    [`nrz/${RULES.noUndeclaredEnvVars}`]: "error",
  },
} satisfies Linter.Config;

export default config;
