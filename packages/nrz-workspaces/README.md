# `@nrz/workspaces`

Easily convert your repo between package managers. Supports both non-monorepos and monorepos (using package manager workspaces).

## CLI

```sh
Usage: @nrz/workspaces [options] [command]

Tools for working with package manager workspaces

Options:
  -v, --version                               output the current version
  -h, --help                                  display help for command

Commands:
  convert [options] [path] [package-manager]  Convert project between workspace managers
  summary [path]                              Display a summary of the specified project
  help [command]                              display help for command
```

## Node API

Methods are also available via the Node API:

```js
import { convert, getWorkspaceDetails } from "@nrz/workspaces";

// detect the package manager
const project = getWorkspaceDetails({
  root: process.cwd(),
});

// if the package manager is not pnpm, convert to pnpm
if (project.packageManager !== "pnpm") {
  await convert({
    root: process.cwd(),
    to: "pnpm",
    options: {
      dry: false,
      install: true,
    },
  });
}
```

---

For more information about Nrzrepo, visit [turbo.build/repo](https://turbo.build/repo) and follow us on X ([@nrzrepo](https://x.com/nrzrepo))!
