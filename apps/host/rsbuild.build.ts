import { defineBuildConfig } from "@workleap/rsbuild-configs";

export default defineBuildConfig({
    environmentVariables: {
        "USE_MSW": process.env.USE_MSW === "true",
        "MODULES": process.env.MODULES
    }
});
