import type { HopperParameters, viewports } from "@internals/hopper-preset-addon";
import type { A11yParameters } from "@storybook/addon-a11y";
import type { ViewportMap } from "@storybook/addon-viewport";
import type { MswParameters } from "msw-storybook-addon";

// Module Augmentation of the Parameters interface.
declare module "storybook-react-rsbuild" {
    interface Parameters {
        msw?: MswParameters["msw"];
        a11y?: A11yParameters;
        hopper?: HopperParameters;
        // There is no typings for this one. So i copied the specs from https://storybook.js.org/docs/essentials/viewport
        viewport?: {
            defaultOrientation?: "portrait" | "landscape";
            defaultViewport?: keyof typeof viewports | (string & {});
            disable?: boolean;
            viewports?: ViewportMap;
        };
        chromatic?: {
            diffThreshold?: number;
            delay?: number;
            forcedColors?: "none" | "active";
            pauseAnimationAtEnd?: boolean;
            disableSnapshot?: boolean;
            ignoreSelectors?: string[];
            prefersReducedMotion?: "no-preference" | "reduce";
            media?: "print";
            modes?: Record<string, {
                /** Disable a mode set in a meta tag or in the storybook's preview */
                disable?: boolean;
            } & {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                [key: string]: any;
            }>;
        };
    }
}

