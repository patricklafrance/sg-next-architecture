import { FireflyDecorator, StorybookRuntime } from "@squide/firefly-rsbuild-storybook";
import { Decorator } from "storybook-react-rsbuild";
import { HopperDecorator } from "./withHopperDecorator.tsx";
import { QueryDecorator } from "./withQueryDecorator.tsx";

export function withModuleDecorator(runtime: StorybookRuntime): Decorator {
    return story => {
        return (
            <FireflyDecorator runtime={runtime}>
                <QueryDecorator>
                    <HopperDecorator>
                        {story()}
                    </HopperDecorator>
                </QueryDecorator>
            </FireflyDecorator>
        );
    };
}
