import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { Decorator } from "storybook-react-rsbuild";
import { QueryClientDefaultOptions } from "../QueryClientDefaultOptions.ts";

const queryClient = new QueryClient({
    defaultOptions: QueryClientDefaultOptions
});

export function withQueryDecorator(): Decorator {
    return story => {
        return (
            <QueryDecorator>
                {story()}
            </QueryDecorator>
        );
    };
}

export function QueryDecorator(props: PropsWithChildren) {
    const {
        children
    } = props;

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
