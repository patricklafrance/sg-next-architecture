import { execSync } from "node:child_process";

/*

TODO:

- Add a component to packages/components and use it in Home

- Add something for home to be affected when packages change

- L'action ne doit pas s'exécuter sur un draft

- Est-ce possible de configurer un repo pour toujours ouvrir une PR en draft?

*/

const DefaultBranch = "main";

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

interface TurborepoAffectedItem {
    name: string;
    path: string;
}

function runChromatic(affectedStorybooks: string[]) {
    const filters = affectedStorybooks.map(x => `--filter=${x}`).join(" ");

    const command = [
        "pnpm turbo chromatic",
        filters,
        "--",
        // Enable Turbosnap.
        "--only-changed",
        // TODO: is it still required for GitHub? It was for ADO but I have a vague memory that it might be specific to ADO.
        // Accept the baseline automatically when chromatic is executed on the default branch.
        // Running Chromatic on the default branch allow us to use "squash" merge for PRs, see: https://www.chromatic.com/docs/custom-ci-provider/#squashrebase-merge-and-the-main-branch.
        `--auto-accept-changes ${DefaultBranch}`,
        // Do not wait for the process to be completed before exiting. The result will be available in the PR.
        "--exit-once-uploaded",
        // Ignore dependabot PRs to save on snapshots.
        "--skip dependabot/**",
        // Upload SAtorybook as a zip file.
        "--zip"
    ].join(" ");

    console.debug(`[chromatic] Running chromatic for ${affectedStorybooks.length} Storybook:`, command);

    try {
        execSync(
            command,
            {
                cwd: process.cwd(),
                // Log chromatic CLI outputs.
                stdio: "inherit"
            }
        );
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("[chromatic] An error occured while executing chromatic:", error.message);
        }

        process.exit(1);
    }
}

const currentBranch = process.env.GITHUB_REF_NAME;

// TODO: is it still required for GitHub? It was for ADO but I have a vague memory that it might be specific to ADO.
if (currentBranch === DefaultBranch) {
    const affectedStorybooks = Object.keys(StorybookMapping);

    console.info(`[chromatic] The current branch is ${DefaultBranch}. Running chromatic for all Storybook applications to auto accept changes:`, affectedStorybooks);

    runChromatic(affectedStorybooks);
}

let affectedPackages: string[];

try {
    // Find packages diverging from the main branch.
    const command = `pnpm turbo ls --filter=[origin/main] --output=json`;

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
} catch (error: unknown) {
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

        runChromatic(affectedStorybooks);
    } else {
        console.info("[chromatic] Found no affected Storybook, exiting.");
    }
} else {
    console.info("[chromatic] Found no affected packages, exiting.");
}

process.exit(0);
