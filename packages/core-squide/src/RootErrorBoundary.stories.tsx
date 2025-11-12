import type { Meta, StoryObj } from "storybook-react-rsbuild";
import { RootErrorBoundary } from "./RootErrorBoundary.js";

const meta = {
    title: "Shell/RootErrorBoundary",
    component: RootErrorBoundary
} satisfies Meta<typeof RootErrorBoundary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;
