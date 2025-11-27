import { ProtectedRoutes, PublicRoutes, type FireflyRuntime, type ModuleRegisterFunction } from "@squide/firefly";
import { ModuleErrorBoundary } from "./ModuleErrorBoundary.tsx";
import { NotFoundPage } from "./NotFoundPage.tsx";
import { RootLayout } from "./RootLayout.tsx";

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
