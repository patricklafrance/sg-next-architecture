import { FireflyRuntime } from "@squide/firefly";
import { Decorator } from "storybook-react-rsbuild";
import { FireflyDecorator } from "./withFireflyDecorator.tsx";
import { HopperDecorator } from "./withHopperDecorator.tsx";
import { QueryDecorator } from "./withQueryDecorator.tsx";

export function withModuleDecorator(fireflyRuntime: FireflyRuntime): Decorator {
    return story => {
        return (
            <FireflyDecorator runtime={fireflyRuntime}>
                <QueryDecorator>
                    <HopperDecorator>
                        {story()}
                    </HopperDecorator>
                </QueryDecorator>
            </FireflyDecorator>
        );
    };
}
