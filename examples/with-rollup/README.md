# Nrzrepo starter with Rollup

This is a community-maintained example. If you experience a problem, please submit a pull request with a fix. GitHub Issues will be closed.

## Using this example

Run the following command:

```sh
npx create-nrz@latest -e with-rollup
```

## What's inside?

This Nrzrepo includes the following packages/apps:

### Apps and Packages

- `web`: a [Next.js](https://nextjs.org) app
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo
- `@repo/ui`: a React component library used by the `web` application, compiled with Rollup

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Nrzrepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-nrzrepo
pnpm run build
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-nrzrepo
pnpm run dev
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Nrzrepo can use a technique known as [Remote Caching](https://nrzrepo.org/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Nrzrepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=nrzrepo-examples), then enter the following commands:

```
cd my-nrzrepo
npx nrz login
```

This will authenticate the Nrzrepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Nrzrepo to your Remote Cache by running the following command from the root of your Nrzrepo:

```
npx nrz link
```

## Useful Links

Learn more about the power of Nrzrepo:

- [Pipelines](https://nrzrepo.org/docs/core-concepts/pipelines)
- [Caching](https://nrzrepo.org/docs/core-concepts/caching)
- [Remote Caching](https://nrzrepo.org/docs/core-concepts/remote-caching)
- [Scoped Tasks](https://nrzrepo.org/docs/core-concepts/scopes)
- [Configuration Options](https://nrzrepo.org/docs/reference/configuration)
- [CLI Usage](https://nrzrepo.org/docs/reference/command-line-reference)
