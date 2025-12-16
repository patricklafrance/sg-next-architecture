import { execSync } from "node:child_process";

interface TurborepoAffectedItem {
    name: string;
    path: string;
}

let affectedPackages: string[];

try {
    // Using "pnpm exec" to ensure turbo is available via PATH.
    // const command = `pnpm exec turbo ls --affected --output=json`;
    const command = `pnpm exec turbo ls --filter=[origin/main] --output=json`;

    const raw = execSync(
        command,
        {
            cwd: process.cwd(),
            encoding: "utf8",
            // Suppress stderr to avoid outputting Turborepo logs.
            stdio: ["ignore", "pipe", "ignore"]
        }
    );

    const parsedResult = JSON.parse(raw);

    affectedPackages = parsedResult.packages?.items.map((x: TurborepoAffectedItem) => x.name) || [];
} catch (error) {
    if (error instanceof Error) {
        console.error("[chromatic] An error occured while retrieving the affected packages from Turborepo:", error.message);
    }

    process.exit(1);
}

if (affectedPackages) {
    console.info(`[chromatic] Found ${affectedPackages.length} affected packages:`, affectedPackages);

    process.exit(0);
} else {
    console.info("[chromatic] Found no affected packages, exiting");
    process.exit(0);
}

