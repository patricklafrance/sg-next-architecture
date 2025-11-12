import { ProtectedRoutes, PublicRoutes, type FireflyRuntime, type ModuleRegisterFunction } from "@squide/firefly";
import { ModuleErrorBoundary } from "./ModuleErrorBoundary.js";
import { NotFoundPage } from "./NotFoundPage.js";
import { RootLayout } from "./RootLayout.js";

export const registerShell: ModuleRegisterFunction<FireflyRuntime> = runtime => {
    runtime.registerRoute({
        element: <RootLayout />,
        children: [
            {
                errorElement: <ModuleErrorBoundary />,
                children: [
                    PublicRoutes,
                    ProtectedRoutes
                ]
            }
        ]
    }, {
        hoist: true
    });

    runtime.registerPublicRoute({
        path: "*",
        element: <NotFoundPage />
    });
};
