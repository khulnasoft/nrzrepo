module.exports = {
  extends: ["@nrz/eslint-config/library"],

  overrides: [
    {
      files: ["__tests__/**"],
      rules: {
        "@typescript-eslint/no-confusing-void-expression": "off",
        "@typescript-eslint/no-unsafe-return": "off",
      },
    },
  ],
};
