import { execSync } from "node:child_process";

/*

TODO:

- Add a component to packages/components and use it in Home

- Add something for home to be affected when packages change

*/

interface TurborepoAffectedItem {
    name: string;
    path: string;
}

const StorybookMapping = {
    "@apps/packages-storybook": [
        "@packages/components"
    ],
    "@apps/home-storybook": [
        "@packages/home-core",
        "@modules/home-management",
        "@modules/home-migration"
    ],
    "@apps/protect-storybook": [
    ]
} as const;

let affectedPackages: string[];

try {
    // - Using "pnpm exec" to ensure turbo is available via PATH.
    // - Using "--filter=[HEAD^1]" instead of "--filter=[origin/main]" to only get the
    //   affected packages since the last commit rather than every packages that diverge from main.
    //
    //   Example:
    //      - If a commit push changes to package "package-1" and "package-2", the affected packages will be "package-1" and "package-2".
    //      - If a subsequent commit push changes to "package-2", the affected packages will only be "package-2".
    //
    // - For the command to return the expected result, the GitHub "checkout" step must have the following options:
    //      fetch-depth: 0
    //      ref: ${{ github.event.pull_request.head.sha }}
    const command = `pnpm exec turbo ls --filter=[HEAD^1] --output=json`;

    const rawResult = execSync(
        command,
        {
            cwd: process.cwd(),
            encoding: "utf8",
            // Suppress stderr to avoid outputting Turborepo logs.
            stdio: ["ignore", "pipe", "ignore"]
        }
    );

    const parsedResult = JSON.parse(rawResult);

    affectedPackages = parsedResult.packages?.items.map((x: TurborepoAffectedItem) => x.name) || [];
} catch (error) {
    if (error instanceof Error) {
        console.error("[chromatic] An error occured while retrieving the affected packages from Turborepo:", error.message);
    }

    process.exit(1);
}

if (affectedPackages.length > 0) {
    console.info(`[chromatic] Found ${affectedPackages.length} affected packages:`, affectedPackages);

    const affectedStorybooks = (Object.keys(StorybookMapping) as (keyof typeof StorybookMapping)[]).filter(x =>
        StorybookMapping[x].some((y: string) => affectedPackages.includes(y))
    );

    if (affectedStorybooks.length > 0) {
        console.info(`[chromatic] Found ${affectedStorybooks.length} affected Storybook:`, affectedStorybooks);

        const filters = affectedStorybooks.join(" --filter=");

        console.log(`pnpm exec turbo chromatic ${filters}`);
    } else {
        console.info("[chromatic] Found no affected Storybook, exiting");
        process.exit(0);
    }
} else {
    console.info("[chromatic] Found no affected packages, exiting");
    process.exit(0);
}

process.exit(0);
