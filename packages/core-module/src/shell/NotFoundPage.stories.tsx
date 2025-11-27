import type { Meta, StoryObj } from "storybook-react-rsbuild";
import { withHopperDecorator } from "../storybook/withHopperDecorator.tsx";
import { NotFoundPage } from "./NotFoundPage.tsx";

const meta = {
    title: "Shell/NotFoundPage",
    component: NotFoundPage,
    decorators: [
        withHopperDecorator()
    ]
} satisfies Meta<typeof NotFoundPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;
