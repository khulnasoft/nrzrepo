# `eslint-plugin-nrz`

Easy ESLint configuration for Nrzrepo

## Installation

1. You'll first need to install [ESLint](https://eslint.org/):

```sh
npm install eslint --save-dev
```

2. Next, install `eslint-plugin-nrz`:

```sh
npm install eslint-plugin-nrz --save-dev
```

## Usage (Flat Config `eslint.config.js`)

ESLint v9 uses the Flat Config format seen below:

```js
import nrz from "eslint-plugin-nrz";

export default [nrz.configs["flat/recommended"]];
```

Otherwise, you may configure the rules you want to use under the rules section.

```js
import nrz from "eslint-plugin-nrz";

export default [
  {
    plugins: {
      nrz,
    },
    rules: {
      "nrz/no-undeclared-env-vars": "error",
    },
  },
];
```

## Example (Flat Config `eslint.config.js`)

```js
import nrz from "eslint-plugin-nrz";

export default [
  {
    plugins: {
      nrz,
    },
    rules: {
      "nrz/no-undeclared-env-vars": [
        "error",
        {
          allowList: ["^ENV_[A-Z]+$"],
        },
      ],
    },
  },
];
```

## Usage (Legacy `eslintrc*`)

Add `nrz` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["nrz"]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "nrz/no-undeclared-env-vars": "error"
  }
}
```

## Example (Legacy `eslintrc*`)

```json
{
  "plugins": ["nrz"],
  "rules": {
    "nrz/no-undeclared-env-vars": [
      "error",
      {
        "allowList": ["^ENV_[A-Z]+$"]
      }
    ]
  }
}
```
