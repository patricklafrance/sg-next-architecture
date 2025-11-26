import { initializeFireflyForStorybook, withModuleDecorator } from "@packages/core-module";
import type { Meta, StoryObj } from "storybook-react-rsbuild";
import { ManagementPage } from "./ManagementPage.tsx";
import { registerManagement } from "./registerManagement.tsx";

const fireflyRuntime = initializeFireflyForStorybook({
    localModules: [registerManagement]
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
