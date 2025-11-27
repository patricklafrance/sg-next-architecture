import { FireflyProvider, FireflyRuntime } from "@squide/firefly";
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

export function FireflyDecorator(props: FireflyDecoratorProps) {
    const {
        runtime,
        children
    } = props;

    return (
        <>
            <FireflyProvider runtime={runtime}>
                {children}
            </FireflyProvider>
        </>
    );
}
