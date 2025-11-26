import type { Meta, StoryObj } from "storybook-react-rsbuild";
import { withHopperDecorator } from "../storybook/withHopperDecorator.tsx";
import { ModuleErrorBoundary } from "./ModuleErrorBoundary.tsx";

const meta = {
    title: "Shell/ModuleErrorBoundary",
    component: ModuleErrorBoundary,
    decorators: [
        withHopperDecorator()
    ]
} satisfies Meta<typeof ModuleErrorBoundary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;
