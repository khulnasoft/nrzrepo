import type { Linter } from "eslint";
import { RULES } from "../../constants";
import { Project } from "../../utils/calculate-inputs";

const project = new Project(process.cwd());
const cacheKey = project.valid() ? project.key() : Math.random();

const config = {
  name: "nrz/recommended",
  rules: {
    [`nrz/${RULES.noUndeclaredEnvVars}`]: "error",
  },
  settings: {
    nrz: {
      cacheKey,
    },
  },
} satisfies Linter.FlatConfig;

export default config;
