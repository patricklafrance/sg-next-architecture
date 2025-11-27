import { AppRouter, FireflyProvider } from "@squide/firefly";
import { PropsWithChildren } from "react";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { Decorator } from "storybook-react-rsbuild";
import { StorybookRuntime } from "./StorybookRuntime.ts";

export function withFireflyAppRouterDecorator(runtime: StorybookRuntime): Decorator {
    return story => {
        return (
            <FireflyAppRouterDecorator runtime={runtime}>
                {story()}
            </FireflyAppRouterDecorator>
        );
    };
}

export interface FireflyAppRouterDecoratorProps extends PropsWithChildren {
    runtime: StorybookRuntime;
}

export function FireflyAppRouterDecorator(props: FireflyAppRouterDecoratorProps) {
    const {
        runtime,
        children: story
    } = props;

    return (
        <FireflyProvider runtime={runtime}>
            <AppRouter strictMode={false}>
                {({ rootRoute, routerProviderProps }) => {
                    return (
                        <RouterProvider
                            router={createMemoryRouter([
                                {
                                    element: rootRoute,
                                    children: [
                                        {
                                            path: "/my-route",
                                            element: story
                                        }
                                    ]
                                }
                            ], {
                                initialEntries: ["/my-route"]
                            })}
                            {...routerProviderProps}
                        />
                    );
                }}
            </AppRouter>
        </FireflyProvider>
    );
}
