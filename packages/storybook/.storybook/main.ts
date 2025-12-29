import { mergeRsbuildConfig } from "@rsbuild/core";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import type { StorybookConfig } from "storybook-react-rsbuild";

const require = createRequire(import.meta.url);

const storybookConfig: StorybookConfig = {
    framework: getAbsolutePath("storybook-react-rsbuild"),
    addons: [
        getAbsolutePath("@storybook/addon-a11y")
    ],
    stories: [
        "../../components/src/**/*.stories.tsx",
        "../../core-module/src/**/*.stories.tsx"
    ],
    staticDirs: ["public"],
    rsbuildFinal: config => {
        return mergeRsbuildConfig(config, {
            tools: {
                rspack: {
                    optimization: {
                        concatenateModules: false
                    }
                }
            }
        });

        // config.plugins = config.plugins || [];

        // config.tools = config.tools || {};
        // config.tools.rspack = config.tools.rspack || {};
        // // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // // @ts-ignore
        // config.tools.rspack.optimization = {
        //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //     // @ts-ignore
        //     ...config.tools.rspack.optimization,
        //     concatenateModules: false
        // };

        // return config;
    }
};

export default storybookConfig;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAbsolutePath(value: string): any {
    return dirname(require.resolve(join(value, "package.json")));
}
