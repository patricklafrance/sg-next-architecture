import { execSync } from "node:child_process";
import { appendFileSync } from "node:fs";

const DefaultBranch = "main";

const StorybookDependencies = {
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
    affectedStorybooks = createAffectedStorybooksRecordFromBooleanValue(true);
} else {
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
            console.error("[getAffectedStorybooks] An error occured while retrieving the affected packages from Turborepo:", error.message);
        }

        process.exit(1);
    }

    if (affectedPackages.length > 0) {
        console.info(`[getAffectedStorybooks] Found ${affectedPackages.length} affected packages:`, affectedPackages);

        affectedStorybooks = (Object.keys(StorybookDependencies) as (keyof typeof StorybookDependencies)[]).reduce((acc, x) => {
            acc[x] =
                // If the package is the actual Storybook application package, add the Storybook package name to the list.
                affectedPackages.includes(x) ||
                // If the package is a dependency of a Storybook application package, add the Storybook package name to the list.
                StorybookDependencies[x].some((y: string) => affectedPackages.includes(y));

            return acc;
        }, {} as Record<keyof typeof StorybookDependencies, boolean>);

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
        affectedStorybooks = createAffectedStorybooksRecordFromBooleanValue(false);
    }
}

const gitHubOutputPath = process.env.GITHUB_OUTPUT;

if (!gitHubOutputPath) {
    throw new Error("[getAffectedStorybooks] GITHUB_OUTPUT is not set.");
}

for (const [key, value] of Object.entries(affectedStorybooks)) {
    appendFileSync(gitHubOutputPath, `${key}=${value}\n`);
}

process.exit(0);

