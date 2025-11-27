import { initializeFireflyForStorybook, withModuleDecorator } from "@packages/core-module";
import type { Meta, StoryObj } from "storybook-react-rsbuild";
import { MigrationPage } from "./MigrationPage.tsx";
import { registerMigration } from "./registerMigration.tsx";

const fireflyRuntime = await initializeFireflyForStorybook({
    localModules: [registerMigration]
});

const meta = {
    title: "Home/Migration/Pages/MigrationPage",
    component: MigrationPage,
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
} satisfies Meta<typeof MigrationPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;
