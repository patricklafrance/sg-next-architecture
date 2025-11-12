import { getEnvironmentVariablesPlugin } from "@squide/env-vars";
import { FireflyRuntime, ModuleRegisterFunction } from "@squide/firefly";

async function registerMsw(runtime: FireflyRuntime) {
    if (runtime.isMswEnabled) {
        const environmentVariables = getEnvironmentVariablesPlugin(runtime).getVariables();

        // Files including an import to the "msw" package are included dynamically to prevent adding
        // MSW stuff to the bundle when it's not used.
        const requestHandlers = (await import("./apiMocks/getRequestHandlers.js")).getRequestHandlers(environmentVariables);

        runtime.registerRequestHandlers(requestHandlers);
    }
}

function registerRoutes(runtime: FireflyRuntime) {
    runtime.registerRoute({
        path: "/management",
        lazy: async () => {
            const { ManagementPage } = await import("./ManagementPage.js");

            return {
                element: <ManagementPage />
            };
        }
    });

    runtime.registerNavigationItem({
        $label: "Management",
        to: "/management"
    });
}

export const registerManagement: ModuleRegisterFunction<FireflyRuntime> = async runtime => {
    await registerMsw(runtime);
    registerRoutes(runtime);
};
