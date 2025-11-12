import type { Meta, StoryObj } from "storybook-react-rsbuild";
import { NotFoundPage } from "./NotFoundPage.js";

const meta = {
    title: "Shell/NotFoundPage",
    component: NotFoundPage
} satisfies Meta<typeof NotFoundPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;
