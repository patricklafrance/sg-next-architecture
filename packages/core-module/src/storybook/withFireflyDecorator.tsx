import { AppRouter, FireflyProvider, FireflyRuntime } from "@squide/firefly";
import { PropsWithChildren } from "react";
import { Decorator } from "storybook-react-rsbuild";

export function withFireflyDecorator(runtime: FireflyRuntime): Decorator {
    return story => {
        return (
            <FireflyDecorator runtime={runtime}>
                {story()}
            </FireflyDecorator>
        );
    };
}

export interface FireflyDecoratorProps extends PropsWithChildren {
    runtime: FireflyRuntime;
}

// TODO: Is useIsBootstrapping missing?
export function FireflyDecorator(props: FireflyDecoratorProps) {
    const {
        runtime,
        children
    } = props;

    return (
        <FireflyProvider runtime={runtime}>
            <AppRouter>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {() => children as any}
            </AppRouter>
        </FireflyProvider>
    );
}
