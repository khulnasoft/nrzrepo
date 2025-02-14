# Nrzrepo Codemods

Nrzrepo provides Codemod transformations to help upgrade your Nrzrepo codebase.

Codemods are transformations that run on your codebase programmatically. This allows for a large amount of changes to be applied without having to manually go through every file.

## Commands

### `migrate`

Updates your Nrzrepo codebase to the specified version of Nrzrepo (defaults to the latest), running any required codemods, and installing the new version of Nrzrepo.

```
Usage: @nrz/codemod migrate|update [options] [path]

Migrate a project to the latest version of Nrzrepo

Arguments:
  path              Directory where the transforms should be applied

Options:
  --from <version>  Specify the version to migrate from (default: current version)
  --to <version>    Specify the version to migrate to (default: latest)
  --install         Install new version of nrz after migration (default: true)
  --force           Bypass Git safety checks and forcibly run codemods (default: false)
  --dry             Dry run (no changes are made to files) (default: false)
  --print           Print transformed files to your terminal (default: false)
  -h, --help        display help for command
```

### `transform` (default)

Runs a single codemod on your codebase. This is the default command, and can be omitted.

```
Usage: @nrz/codemod transform [options] [transform] [path]
       @nrz/codemod [options] [transform] [path]

Apply a single code transformation to a project

Arguments:
  transform   The transformer to run
  path        Directory where the transforms should be applied

Options:
  --force     Bypass Git safety checks and forcibly run codemods (default: false)
  --list      List all available transforms (default: false)
  --dry       Dry run (no changes are made to files) (default: false)
  --print     Print transformed files to your terminal (default: false)
  -h, --help  display help for command
```

## Developing

To add a new transformer, run `pnpm add-transformer`, or [view the complete guide](./src/transforms/README.md).
