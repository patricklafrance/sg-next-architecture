import { initializeFireflyForStorybook, withModuleDecorator } from "@packages/core-module";
import type { Meta, StoryObj } from "storybook-react-rsbuild";
import { HomePage } from "./HomePage.tsx";
import { registerHost } from "./registerHost.tsx";

const fireflyRuntime = await initializeFireflyForStorybook({
    localModules: [registerHost]
});

const meta = {
    title: "Host/Pages/HomePage",
    component: HomePage,
    decorators: [
        withModuleDecorator(fireflyRuntime)
    ],
    parameters: {
        msw: {
            handlers: [
                ...fireflyRuntime.requestHandlers
            ]
        }
    }
} satisfies Meta<typeof HomePage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;
