import type { Meta, StoryObj } from "storybook-react-rsbuild";
import { ModuleErrorBoundary } from "./ModuleErrorBoundary.js";

const meta = {
    title: "Shell/ModuleErrorBoundary",
    component: ModuleErrorBoundary
} satisfies Meta<typeof ModuleErrorBoundary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;
