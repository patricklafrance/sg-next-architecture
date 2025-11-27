import { FireflyProvider } from "@squide/firefly";
import { PropsWithChildren } from "react";
import { Decorator } from "storybook-react-rsbuild";
import { StorybookRuntime } from "./StorybookRuntime.ts";

export function withFireflyDecorator(runtime: StorybookRuntime): Decorator {
    return story => {
        return (
            <FireflyDecorator runtime={runtime}>
                {story()}
            </FireflyDecorator>
        );
    };
}

export interface FireflyDecoratorProps extends PropsWithChildren {
    runtime: StorybookRuntime;
}

export function FireflyDecorator(props: FireflyDecoratorProps) {
    const {
        runtime,
        children
    } = props;

    return (
        <FireflyProvider runtime={runtime}>
            {children}
        </FireflyProvider>
    );
}
