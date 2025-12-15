import { withModuleDecorator } from "@packages/core-module";
import { initializeFireflyForStorybook } from "@squide/firefly-rsbuild-storybook";
import type { Meta, StoryObj } from "storybook-react-rsbuild";
import { ManagementPage } from "./ManagementPage.tsx";
import { registerHomeManagement } from "./registerHomeManagement.js";

const fireflyRuntime = await initializeFireflyForStorybook({
    localModules: [registerHomeManagement]
});

const meta = {
    title: "Home/Management/Pages/ManagementPage",
    component: ManagementPage,
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
} satisfies Meta<typeof ManagementPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;
