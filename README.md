# sg-next-architecture

This repository is a proof of concept (POC) that explores how to set up a monorepo for a large, [modular monolith](https://www.geeksforgeeks.org/system-design/what-is-a-modular-monolith) hosting multiple products (unified application). The main motivations behind this architectural approach are simplicity, faster execution, and an improved user experience.

From a UX perspective, the assumption is that switching between products within a unified application provides a smoother experience than architectural patterns such as [microfrontends](https://micro-frontends.org/). In a unified application, there is little to no remote context to load when users navigate between products, which helps reduce latency and visual disruptions.

The goal of this POC is to demonstrate how tools such as [Storybook](https://storybook.js.org/), [Chromatic](https://www.chromatic.com/), and CI workflows can be configured so that individual teams are not penalized by changes in code outside their ownership boundaries, while still allowing these tools to run efficiently at scale.

The approach tested in this POC involves splitting the codebase into domain-oriented modules and relying on Turborepo to detect unaffected modules and skip them during operations such as building, linting, type checking, and testing, including visual regression testing with Chromatic.

## Monorepo structure

### `apps` folder

```
monorepo
├── apps  <----------------
├────── home
├──────── core
├──────── modules
├──────── storybook
├────── host
├────── protect
├────── storybook
├── packages
├── tooling
```

The `apps` folder include the host application (the entry point of the unified app) and the different products that will be part of the unified applications. 

Every product folder includes (`home` & `protect`):

- Subfolders for the specific modules of the products.
- A `storybook` folder for the stories of the product (will be explained in the [chromatic](#chromatic) section).
- A `core` folder to share product specific core between the modules of the product.

Lastly, the `apps/storybook` folder is a Storybook instance that aggregates the stories of the whole monorepo. This means the stories of all the products, of the packages, etc.. The goal of this Storybook instance is to provide a unique Storybook entry point to faciliate collaboration.


The `apps` folder contains the host application (the entry point of the unified application) as well as the different products that are part of it.

Each product folder (for example, home` and `protect`) includes:

- Subfolders for product-specific modules.
- A `storybook` folder that contains the product's stories (explained in the [chromatic](#chromatic) section).
- A `core` folder used to share product-specific logic across its modules.

Finally, the `apps/storybook` folder is a Storybook instance that aggregates stories from the entire monorepo. This includes stories from all products and shared packages. Its purpose is to provide a single Storybook entry point to facilitate collaboration and discovery.

### `packages` folder

```
monorepo
├── apps  
├── packages <----------------
├────── components
├────── core
├────── core-module
├────── storybook
├── tooling
```

The packages` folder contains code that is shared across multiple apps.

We intentionally rely on `core` folders to limit the proliferation of packages, which can quickly become difficult to manage as the codebase grows.

Similar to `apps/storybook`, the `packages/storybook` folder hosts a Storybook instance that aggregates stories for all shared packages.

## Workflows

### CI

The [ci.yml](.github/workflows/ci.yml) workflow builds, lints, and tests the applications using Turborepo to run tasks only on projects (modules, packages, etc.) that have changed. As a result, a team working on a specific module typically does not need to build, lint, or test code that falls outside the boundaries of that module.

### Chromatic

The [chromatic.yml](.github/workflows/chromatic.yml) workflow runs the individual Storybook instances (such as `apps/home/storybook`, `apps/protect/storybook`, and `packages/storybook`) using the Chromatic cloud service. To control costs, the goal is to avoid running Storybook instances that are unaffected by a given change, since even [Turbosnaps](https://www.chromatic.com/docs/turbosnap/) incur usage costs.

To achieve this, the workflow relies on Turborepo ([tooling/getAffectedStorybooks.ts](./tooling/getAffectedStorybooks.ts)) to determine which Storybook instances need to be built and uploaded to Chromatic for visual regression testing.

## Artefacts

- Full Storybook: https://sg-next-architecture-storybook.netlify.app/ (the `apps/storybook` instance)
- Chromatic - Home: https://www.chromatic.com/builds?appId=694091b0077ec66d8a8497d8
- Chromatic - Packages: https://www.chromatic.com/builds?appId=6940bf47c8604e3dc478b71c

## Findings

### Postinstall scripts

In "postinstall" scripts use "pnpm exec msw" rather than "pnpm msw" to avoid corrupting PNPM state. The corruptions have been occuring when deploying the Storybook app using Netlify PR deploy.

Here's the difference between both of them according to Chat GPT:

- pnpm msw … starts a nested pnpm command while pnpm is still installing, which is what commonly triggers the corrupted workspace-state JSON and the Unexpected end of JSON input.
- pnpm exec … just runs the MSW binary from the workspace context without re-entering pnpm's "install" logic.

A
