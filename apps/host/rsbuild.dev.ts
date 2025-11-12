import { loadEnv } from "@rsbuild/core";
import { defineDevConfig } from "@workleap/rsbuild-configs";
import path from "node:path";

const { parsed } = loadEnv({
    cwd: path.resolve("../..")
});

export default defineDevConfig({
    environmentVariables: {
        "USE_MSW": process.env.USE_MSW === "true",
        "MODULES": process.env.MODULES,
        ...parsed
    }
});
