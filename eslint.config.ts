import { defineMonorepoWorkspaceConfig } from "@workleap/eslint-configs";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
    globalIgnores([
        "apps",
        "packages"
    ]),
    defineMonorepoWorkspaceConfig(import.meta.dirname)
]);
