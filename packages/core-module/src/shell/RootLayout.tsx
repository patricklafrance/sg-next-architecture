import {
    isNavigationLink,
    useNavigationItems,
    useRenderedNavigationItems,
    type RenderItemFunction,
    type RenderSectionFunction
} from "@squide/firefly";
import { Suspense } from "react";
import { Link, Outlet } from "react-router";

const renderItem: RenderItemFunction = (item, key) => {
    // Not supporting nested navigation items for now.
    if (!isNavigationLink(item)) {
        return null;
    }

    const { label, linkProps, additionalProps } = item;

    return (
        <li key={key}>
            <Link {...linkProps} {...additionalProps}>
                {label}
            </Link>
        </li>
    );
};

const renderSection: RenderSectionFunction = (elements, key) => {
    return (
        <ul key={key}>
            {elements}
        </ul>
    );
};

export function RootLayout() {
    const navigationItems = useNavigationItems();
    const navigationElements = useRenderedNavigationItems(navigationItems, renderItem, renderSection);

    return (
        <>
            <nav>{navigationElements}</nav>
            <Suspense fallback={<div>Loading...</div>}>
                <Outlet />
            </Suspense>
        </>
    );
}
