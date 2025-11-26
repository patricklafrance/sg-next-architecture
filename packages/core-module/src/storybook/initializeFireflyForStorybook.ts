import { EnvironmentVariables, EnvironmentVariablesPlugin } from "@squide/env-vars";
import { FireflyRuntime, ModuleRegisterFunction, registerLocalModules } from "@squide/firefly";
import { getEnvironmentVariables } from "../getEnvironmentVariables.ts";

export interface InitializeFireflyForStorybookOptions {
    localModules?: ModuleRegisterFunction<FireflyRuntime>[];
    environmentVariables?: EnvironmentVariables;
}

export function initializeFireflyForStorybook(options: InitializeFireflyForStorybookOptions = {}) {
    const {
        localModules = [],
        environmentVariables = {}
    } = options;

    const runtime = new FireflyRuntime({
        mode: "development",
        useMsw: true,
        plugins: [
            x => new EnvironmentVariablesPlugin(x, {
                environmentVariables: {
                    ...getEnvironmentVariables("msw"),
                    ...environmentVariables
                }
            })
        ]
    });

    registerLocalModules(localModules, runtime).then(() => {
        if (runtime.isMswEnabled) {
            // TODO: Dispatch MSW is ready.
        }
    });

    return runtime;
}
