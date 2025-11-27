import { EnvironmentVariables, EnvironmentVariablesPlugin } from "@squide/env-vars";
import { FireflyRuntime, ModuleRegisterFunction, MswPlugin, toLocalModuleDefinitions } from "@squide/firefly";
import { getEnvironmentVariables } from "../getEnvironmentVariables.ts";
import { StorybookRuntime } from "./StorybookRuntime.ts";

export interface InitializeFireflyForStorybookOptions {
    localModules?: ModuleRegisterFunction<FireflyRuntime>[];
    environmentVariables?: EnvironmentVariables;
}

export async function initializeFireflyForStorybook(options: InitializeFireflyForStorybookOptions = {}) {
    const {
        localModules = [],
        environmentVariables = {}
    } = options;

    const runtime = new StorybookRuntime({
        mode: "development",
        plugins: [
            x => new MswPlugin(x),
            x => new EnvironmentVariablesPlugin(x, {
                variables: {
                    ...getEnvironmentVariables("msw"),
                    ...environmentVariables
                }
            })
        ]
    });

    await runtime.moduleManager.registerModules([
        ...toLocalModuleDefinitions(localModules)
    ]);

    return runtime;
}
