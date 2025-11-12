import { defineMonorepoWorkspaceConfig } from "@workleap/eslint-configs";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
    globalIgnores([
        "apps",
        "modules",
        "packages",
        "smoke-tests"
    ]),
    defineMonorepoWorkspaceConfig(import.meta.dirname)
]);
