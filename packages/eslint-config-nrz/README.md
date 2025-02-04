# `eslint-config-nrz`

Ease configuration for Nrzrepo

## Installation

1. You'll first need to install [ESLint](https://eslint.org/):

```sh
npm install eslint --save-dev
```

2. Next, install `eslint-config-nrz`:

```sh
npm install eslint-config-nrz --save-dev
```

## Usage (Flat Config `eslint.config.js`)

```js
import nrzConfig from "eslint-config-nrz/flat";

export default [
  ...nrzConfig,
  // Other configuration
];
```

You can also configure rules available in the configuration:

```js
import nrzConfig from "eslint-config-nrz/flat";

export default [
  ...nrzConfig,
  // Other configuration
  {
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

Add `nrz` to the extends section of your eslint configuration file. You can omit the `eslint-config-` prefix:

```json
{
  "extends": ["nrz"]
}
```

You can also configure rules available in the configuration:

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
