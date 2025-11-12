import type { Meta, StoryObj } from "storybook-react-rsbuild";
import { HomePage } from "./HomePage.tsx";

const meta = {
    title: "Pages/HomePage",
    component: HomePage
} satisfies Meta<typeof HomePage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;
