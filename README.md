# sg-next-architecture

This repository is a proof of concept (POC) that explores how to set up a monorepo for a large, [modular monolith](https://www.geeksforgeeks.org/system-design/what-is-a-modular-monolith) hosting multiple products (unified application). The main motivations behind this architectural approach are simplicity, faster execution, and an improved user experience.

From a UX perspective, the assumption is that switching between products within a unified application provides a smoother experience than architectural patterns such as [microfrontends](https://micro-frontends.org/). In a unified application, there is little to no remote context to load when users navigate between products, which helps reduce latency and visual disruptions.

The goal of this POC is to demonstrate how tools such as [Storybook](https://storybook.js.org/), [Chromatic](https://www.chromatic.com/), and CI workflows can be configured so that individual teams are not penalized by changes in code outside their ownership boundaries, while still allowing these tools to run efficiently at scale.

The approach tested in this POC involves splitting the codebase into domain-oriented modules and relying on Turborepo to detect unaffected modules and skip them during operations such as building, linting, type checking, and testing, including visual regression testing with Chromatic.

## Structure

TBD

## Artefacts

- Full Storybook: https://sg-next-architecture-storybook.netlify.app/
- Chromatic - Home: https://www.chromatic.com/builds?appId=694091b0077ec66d8a8497d8
- Chromatic - Packages: https://www.chromatic.com/builds?appId=6940bf47c8604e3dc478b71c

## Findings

### Postinstall scripts

In "postinstall" scripts use "pnpm exec msw" rather than "pnpm msw" to avoid corrupting PNPM state. The corruptions have been occuring when deploying the Storybook app using Netlify PR deploy.

Here's the difference between both of them according to Chat GPT:

- pnpm msw … starts a nested pnpm command while pnpm is still installing, which is what commonly triggers the corrupted workspace-state JSON and the Unexpected end of JSON input.
- pnpm exec … just runs the MSW binary from the workspace context without re-entering pnpm's "install" logic.
