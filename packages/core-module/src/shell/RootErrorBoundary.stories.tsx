import type { Meta, StoryObj } from "storybook-react-rsbuild";
import { withHopperDecorator } from "../storybook/withHopperDecorator.tsx";
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";

const meta = {
    title: "Shell/RootErrorBoundary",
    component: RootErrorBoundary,
    decorators: [
        withHopperDecorator()
    ]
} satisfies Meta<typeof RootErrorBoundary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;
