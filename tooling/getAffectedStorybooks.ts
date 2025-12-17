import { execSync } from "node:child_process";
import { appendFileSync } from "node:fs";

const DefaultBranch = "main";

const StorybookDependencies = {
    "@apps/packages-storybook": [
        "@packages/components"
    ],
    "@apps/home-storybook": [
        "@packages/components",
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

let affectedPackages: string[];
let affectedStorybooks: Record<keyof typeof StorybookDependencies, boolean>;

function createAffectedStorybooksRecordFromBooleanValue(value: boolean) {
    return (Object.keys(StorybookDependencies) as (keyof typeof StorybookDependencies)[]).reduce((acc, x) => {
        acc[x] = value;

        return acc;
    }, {} as Record<keyof typeof StorybookDependencies, boolean>);
}

// TODO: is it still required for GitHub? It was for ADO but I have a vague memory that it might be specific to ADO.
if (process.env.GITHUB_REF_NAME === DefaultBranch) {
    // When the GitHub action runs on the default branch, all Storybook applications are affected
    // and will "auto-accept" changes (configured in the GitHub action).
    affectedStorybooks = createAffectedStorybooksRecordFromBooleanValue(true);

    console.info(`[getAffectedStorybooks] This is the "${DefaultBranch}" branch. Run chromatic with "auto-accept" changes for all Storybook applications.`);
} else {
    try {
        const baseSha = process.env.PR_BASE_SHA;

        // If a pull request base SHA is available, use it as the comparison baseline,
        // otherwise, fallback to the defaukt branch.
        const filter = baseSha
            ? `--filter=...[${baseSha}]`
            : `--filter=[origin/${DefaultBranch}]`;

        // Find packages diverging from the main branch.
        const command = `pnpm turbo ls ${filter} --output=json`;

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
        // TODO: on an error, maybe return all the Storybooks as affected?
        // -> bail

        if (error instanceof Error) {
            console.error("[getAffectedStorybooks] An error occured while retrieving the affected packages from Turborepo:", error.message);
        }

        process.exit(1);
    }

    if (affectedPackages.length > 0) {
        console.info(`[getAffectedStorybooks] Found ${affectedPackages.length} affected packages:`, affectedPackages);

        // Find the affected Storybook applications based on the affected packages.
        affectedStorybooks = (Object.keys(StorybookDependencies) as (keyof typeof StorybookDependencies)[]).reduce((acc, x) => {
            acc[x] =
                // If the package is the actual Storybook application package, add the Storybook package name to the list.
                affectedPackages.includes(x) ||
                // If the package is a dependency of a Storybook application package, add the Storybook package name to the list.
                StorybookDependencies[x].some((y: string) => affectedPackages.includes(y));

            return acc;
        }, {} as Record<keyof typeof StorybookDependencies, boolean>);

        // Get the package name of only the affected Storybook applications.
        const packageNames = (Object.keys(affectedStorybooks) as (keyof typeof StorybookDependencies)[]).reduce((acc, x) => {
            if (affectedStorybooks[x]) {
                acc.push(x);
            }

            return acc;
        }, [] as (keyof typeof StorybookDependencies)[]);

        if (packageNames.length > 0) {
            console.info(`[getAffectedStorybooks] Found ${packageNames.length} affected Storybook applications:`, packageNames);
        }
    } else {
        console.info("[getAffectedStorybooks] Found no affected package.");

        affectedStorybooks = createAffectedStorybooksRecordFromBooleanValue(false);
    }
}

const gitHubOutputPath = process.env.GITHUB_OUTPUT;

if (!gitHubOutputPath) {
    throw new Error("[getAffectedStorybooks] The \"GITHUB_OUTPUT\" environment variable is not set.");
}

// Values will be available in the GitHub action using syntax like: "steps.affected.outputs['@apps/packages-storybook']"".
for (const [key, value] of Object.entries(affectedStorybooks)) {
    appendFileSync(gitHubOutputPath, `${key}=${value}\n`);
}

process.exit(0);

