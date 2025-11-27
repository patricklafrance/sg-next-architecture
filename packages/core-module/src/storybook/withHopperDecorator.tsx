import { HopperProvider } from "@hopper-ui/components";
import { PropsWithChildren } from "react";
import { Decorator } from "storybook-react-rsbuild";

export function withHopperDecorator(): Decorator {
    return story => {
        return (
            <HopperDecorator>
                {story()}
            </HopperDecorator>
        );
    };
}

export function HopperDecorator(props: PropsWithChildren) {
    const {
        children
    } = props;

    return (
        <HopperProvider
            backgroundColor="neutral"
            color="neutral"
            fontWeight="body-md"
            lineHeight="body-md"
            fontFamily="body-md"
            fontSize="body-md"
            padding="core_160"
        >
            {children}
        </HopperProvider>
    );
}
