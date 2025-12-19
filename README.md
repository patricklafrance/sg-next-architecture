# sg-next-architecture

- Chromatic - Home: https://www.chromatic.com/builds?appId=694091b0077ec66d8a8497d8
- Chromatic - Packages: https://www.chromatic.com/builds?appId=6940bf47c8604e3dc478b71c

t2ss

## Findings

### Postinstall scripts

In "postinstall" scripts use "pnpm exec msw" rather than "pnpm msw" to avoid corrupting PNPM state. The corruptions have been occuring when deploy the Storybook app using Netlify PR deploy.

Here's the difference between both of them according to Chat GPT:

- pnpm msw … starts a nested pnpm command while pnpm is still installing, which is what commonly triggers the corrupted workspace-state JSON and the Unexpected end of JSON input.
- pnpm exec … just runs the MSW binary from the workspace context without re-entering pnpm's "install" logic.

## Contributing

If you'd like to contribute, please read the [CONTRIBUTING](./CONTRIBUTING.md) documentation before submitting a pull request.
