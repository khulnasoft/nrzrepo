# `@nrz/gen`

Types for working with [Nrzrepo Generators](https://turbo.build/repo/docs/core-concepts/monorepos/code-generation).

## Usage

Install:

```bash
pnpm add @nrz/gen --save-dev
```

Use types within your generator `config.ts`:

```ts filename="nrz/generators/config.ts"
import type { PlopTypes } from "@nrz/gen";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  // create a generator
  plop.setGenerator("Generator name", {
    description: "Generator description",
    // gather information from the user
    prompts: [
      ...
    ],
    // perform actions based on the prompts
    actions: [
      ...
    ],
  });
}
```

Learn more about Nrzrepo Generators in the [docs](https://turbo.build/repo/docs/core-concepts/monorepos/code-generation)

---

For more information about Nrzrepo, visit [turbo.build](https://turbo.build) and follow us on X ([@nrzrepo](https://x.com/nrzrepo))!
