import { initializeFireflyForStorybook, withFireflyDecorator } from "@squide/firefly-rsbuild-storybook";
import type { Meta, StoryObj } from "storybook-react-rsbuild";
import { withHopperDecorator } from "../storybook/withHopperDecorator.tsx";
import { RootLayout } from "./RootLayout.tsx";

const fireflyRuntime = await initializeFireflyForStorybook({
    localModules: [
        runtime => {
            for (let i = 1; i <= 3; i += 1) {
                runtime.registerNavigationItem({
                    $label: `Item ${i}`,
                    to: `/item-${i}`
                });
            }
        }
    ]
});

const meta = {
    title: "Shell/RootLayout",
    component: RootLayout,
    decorators: [
        withFireflyDecorator(fireflyRuntime),
        withHopperDecorator()
    ]
} satisfies Meta<typeof RootLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;
