# Contributing

The following documentation is only for the maintainers of this repository.

- [Monorepo setup](#monorepo-setup)
- [Installation](#installation)
- [Project overview](#project-overview)
- [Pull Request](#pull-request)
- [Deployment](#deployment)
- [Add a new package to the monorepo](#add-a-new-package-to-the-monorepo)

## Monorepo setup

This repository is managed as a monorepo with [PNPM workspace](https://pnpm.io/workspaces) to handle the installation of the npm dependencies and manage the packages interdependencies.

It's important to note that PNPM workspace doesn't hoist the npm dependencies at the root of the workspace as most package manager does. Instead, it uses an advanced [symlinked node_modules structure](https://pnpm.io/symlinked-node-modules-structure). This means that you'll find a `node_modules` directory inside the packages folders as well as at the root of the repository.

The main difference to account for is that the `devDependencies` must now be installed locally in every package `package.json` file rather than in the root `package.json` file.

### Turborepo

This repository use [Turborepo](https://turbo.build/repo/docs) to execute it's commands. Turborepo help saving time with it's built-in cache but also ensure the packages topological order is respected when executing commands.

To be understand the relationships between the commands, have a look at this repository [turbo.json](./turbo.json) configuration file.

### JIT packages

When possible, the packages and the sample applications' projects are configured for [JIT packages](https://www.shew.dev/monorepos/packaging/jit).

## Installation

This project uses PNPM, therefore, you must install [PNPM](https://pnpm.io/installation) v9+ first:

```bash
npm install -g pnpm
```

To install the dependencies of this repository, open a terminal at the root of the workspace and execute the following commands:

```bash
pnpm install
```

Then, use any of the available [commands](#commands) to start developing.

### Setup environment variables

Ids, keys and tokens must set to send data to the different development environment of the telemetry platforms.

First, create a file named `.env.local` at the root of the workspace:

```
workspace
├── package.json
├── .env.local
```

Then, add the following key/values to the newly created `.env.local` file:

- `LOGROCKET_APP_ID`: The application id of the `frontend-platform-team-dev` LogRocket project.
- `HONEYCOMB_API_KEY`: The API key of the `frontend-platform-team-dev` Honeycomb environment.

> [!NOTE]
> The `.env.local` file is configured to be ignored by Git and will not be pushed to the remote repository.

## Project overview

TBD

## Pull Request

### Naming

All pull request (PR) titles must adhere to the [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/#specification). This ensures consistency and clarity in our commit and PR history.

The allowed format for PR titles is:

```
type(scope): subject
```

Where:

- type must be one of the following: fix, feat, build, chore, docs, test, refactor, ci, perf, style, or revert.
- scope is an optional area of the codebase affected.
- subject is a brief description of the change.

A workflow in our CI validates that the PR title includes a valid type from the allowed list. If the workflow fails due to an incorrect PR title format, please manually retrigger the workflow after updating the title to conform to the specification.

### Linting

Every PR automatically triggers linting on the project files. The following tools (but not limited to) are executed as part of the process:

- [ESLint](https://eslint.org/): Ensures consistent and error-free JavaScript/TypeScript code.
- [Stylelint](https://stylelint.io/): Enforces consistent styling in CSS and other style files.
- [Syncpack](https://jamiemason.github.io/syncpack/): Validates and organizes package.json dependencies.
- [tsc](https://www.typescriptlang.org/docs/handbook/compiler-options.html): Performs static type checking using the TypeScript compiler.

### Smoke tests

Finally, add smoke tests for any new widgets. These tests should be placed in the [test](./smoke-tests/tests/) folder of the [smoke-tests](./smoke-tests/) project. Smoke tests are executed automatically in CI against the repository's sample applications.

For local development, it's often easier to run [Playwright](https://playwright.dev/) directly. Here are a few options:

- From the root of the monorepo workspace, run the `pnpm smoke-test-local` command.
- From the `smoke-tests` project, run one of the following commands:
    - `smoke-test-local`
    - `smoke-test-local-ui`
    - `smoke-test-local-debug`

### Chromatic

Every PR automatically validate the Storybook stories with Chromatic to catch visual regressions. Once the validation is done, a message is posted in the PR with a link to the "report".

### Netlify Preview Deployment

Every PR automatically deploy a preview environment with the PR code to Netlify. Once the preview environment is ready, a message is posted in the PR with a link to newly created environment.

### Continuous Integration

Many CI tasks are also executed when a PR is opened:

- Running linters such as ESLint, type checking with tsc, syncpack, etc..
- Running unit tests
- Building the apps, packages and sample applications

### Continuous Delivery

TBD

## Deploy the application

TBD

## Add a new package to the monorepo

### sideEffects

Make sure to add a `sideEffect` field to the `package.json` file:

```json
{
    "sideEffects": false
}
```

Most of the time, the value will be `false` but if your package contains CSS or any other [side effect](https://sgom.es/posts/2020-06-15-everything-you-never-wanted-to-know-about-side-effects/), make sure to set the value accordingly.

### Dependencies

npm *dependencies* and *peerDependencies* must be added to the package own *package.json* file.
