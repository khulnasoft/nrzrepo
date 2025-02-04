const plugin = require("eslint-plugin-nrz");

module.exports = [
  {
    plugins: {
      nrz: plugin,
    },
    rules: {
      "nrz/no-undeclared-env-vars": "error",
    },
  },
];
