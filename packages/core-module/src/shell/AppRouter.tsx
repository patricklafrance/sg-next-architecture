import { Div, HopperProvider } from "@hopper-ui/components";
import { AppRouter as FireflyAppRouter, useIsBootstrapping } from "@squide/firefly";
import { createBrowserRouter, Outlet } from "react-router";
import { RouterProvider } from "react-router/dom";
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";

function BootstrappingRoute() {
    if (useIsBootstrapping()) {
        return <Div>Loading...</Div>;
    }

    return (
        <HopperProvider withBodyStyle>
            <Outlet />
        </HopperProvider>
    );
}

export function AppRouter() {
    return (
        <FireflyAppRouter>
            {({ rootRoute, registeredRoutes, routerProviderProps }) => {
                return (
                    <RouterProvider
                        router={createBrowserRouter([
                            {
                                element: rootRoute,
                                errorElement: <RootErrorBoundary />,
                                children: [
                                    {
                                        element: <BootstrappingRoute />,
                                        children: registeredRoutes
                                    }
                                ]
                            }
                        ])}
                        {...routerProviderProps}
                    />
                );
            }}
        </FireflyAppRouter>
    );
}
