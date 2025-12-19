# sg-next-architecture

- Chromatic - Home: https://www.chromatic.com/builds?appId=694091b0077ec66d8a8497d8
- Chromatic - Packages: https://www.chromatic.com/builds?appId=6940bf47c8604e3dc478b71c

## Findings

- It's important to use "pnpm exec msw" rather than "pnpm msw" is postinstall script as it can corrupt PNPM state and cause issue with Netlify PR deploys.

## Contributing

If you'd like to contribute, please read the [CONTRIBUTING](./CONTRIBUTING.md) documentation before submitting a pull request.
