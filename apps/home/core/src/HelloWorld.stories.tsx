import { withHopperDecorator } from "@packages/core-module";
import type { Meta, StoryObj } from "storybook-react-rsbuild";
import { HelloWorld } from "./HelloWorld.tsx";

const meta = {
    title: "Home/Components/HelloWorld",
    component: HelloWorld,
    decorators: [
        withHopperDecorator()
    ]
} satisfies Meta<typeof HelloWorld>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;
