import "./index.css";

import { HopperProvider } from "@hopper-ui/components";
import { FireflyProvider, initializeFirefly } from "@squide/firefly";
import { initialize as initializeMsw, mswLoader } from "msw-storybook-addon";
import { Suspense } from "react";
import type { Preview } from "storybook-react-rsbuild";

initializeMsw({
    onUnhandledRequest: "bypass"
});

const fireflyRuntime = initializeFirefly({
    useMsw: false
});

const preview: Preview = {
    decorators: [
        Story => {
            return (
                <Suspense fallback="UNHANDLED SUSPENSE BOUNDARY, should be handled in your components...">
                    <FireflyProvider runtime={fireflyRuntime}>
                        <HopperProvider
                            backgroundColor="neutral"
                            color="neutral"
                            fontWeight="body-md"
                            lineHeight="body-md"
                            fontFamily="body-md"
                            fontSize="body-md"
                            padding="core_160"
                        >
                            <Story />
                        </HopperProvider>
                    </FireflyProvider>
                </Suspense>
            );
        }
    ],
    loaders: [mswLoader]
};

export default preview;
