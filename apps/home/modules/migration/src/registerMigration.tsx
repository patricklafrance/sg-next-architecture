import { FireflyRuntime, ModuleRegisterFunction } from "@squide/firefly";

async function registerMsw(runtime: FireflyRuntime) {
    if (runtime.isMswEnabled) {
        // Files including an import to the "msw" package are included dynamically to prevent adding
        // MSW stuff to the bundle when it's not used.
        const requestHandlers = (await import("./apiMocks/getRequestHandlers.js")).getRequestHandlers(runtime.getEnvironmentVariables());

        runtime.registerRequestHandlers(requestHandlers);
    }
}

function registerRoutes(runtime: FireflyRuntime) {
    runtime.registerRoute({
        path: "/migration",
        lazy: async () => {
            const { MigrationPage } = await import("./MigrationPage.js");

            return {
                element: <MigrationPage />
            };
        }
    });

    runtime.registerNavigationItem({
        $label: "Migration",
        to: "/migration"
    });
}

export const registerMigration: ModuleRegisterFunction<FireflyRuntime> = async runtime => {
    await registerMsw(runtime);
    registerRoutes(runtime);
};
