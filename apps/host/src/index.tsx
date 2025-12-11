import "./index.css";

import { getEnvironmentVariables, registerShell } from "@packages/core-module";
import { FireflyProvider, getFeatureFlag, initializeFirefly } from "@squide/firefly";
import { BrowserConsoleLogger, RootLogger } from "@workleap/logging";
import { LogRocketLogger } from "@workleap/logrocket";
import { initializeTelemetry, InitializeTelemetryOptions } from "@workleap/telemetry";
import { initialize as initializeLaunchDarkly } from "launchdarkly-js-client-sdk";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { getActiveModules } from "./getActiveModules.ts";
import { QueryProvider } from "./QueryProvider.tsx";
import { registerHost } from "./registerHost.tsx";

const launchDarklyClient = initializeLaunchDarkly(process.env.LAUNCH_DARKLY_CLIENT_ID!, {
    kind: "user",
    anonymous: true
}, {
    // It's important to use the stream mode to receive feature flags
    // updates in real time.
    streaming: true
});

try {
    // Always initialize the client before creating the plugin instance.
    await launchDarklyClient.waitForInitialization(5);

    console.log("[host] LaunchDarly client is initialized with the following flags:", launchDarklyClient.allFlags());
} catch (error: unknown) {
    console.error("[host] LaunchDarkly client failed to initialize:", error);
}

const isLogRocketEnabled = getFeatureFlag(launchDarklyClient, "enable-log-rocket", true) && !!process.env.LOGROCKET_APP_ID;
const isHoneycombEnabled = getFeatureFlag(launchDarklyClient, "enable-honeycomb", true) && !!process.env.HONEYCOMB_API_KEY;
const isMixpanelEnabled = getFeatureFlag(launchDarklyClient, "enable-mixpanel", true);
const environmentVariables = getEnvironmentVariables("msw");

const loggers: RootLogger[] = [new BrowserConsoleLogger()];

if (isLogRocketEnabled) {
    loggers.push(new LogRocketLogger());
}

const telemetryOptions: InitializeTelemetryOptions = {
    verbose: true,
    loggers
};

if (isHoneycombEnabled) {
    telemetryOptions.honeycomb = {
        namespace: "sharegate",
        serviceName: "home-host",
        apiServiceUrls: [/.+/g],
        options: {
            apiKey: process.env.HONEYCOMB_API_KEY
        }
    };
} else {
    console.warn("[host] Cannot register Honeycomb instrumentation because the HONEYCOMB_API_KEY environment variable has not been configured.");
}

if (isLogRocketEnabled) {
    telemetryOptions.logRocket = {
        appId: process.env.LOGROCKET_APP_ID!
    };
} else {
    console.warn("[host] Cannot register LogRocket instrumentation because the LOGROCKET_APP_ID environment variable has not been configured.");
}

if (isMixpanelEnabled) {
    telemetryOptions.mixpanel = {
        productId: "sharegate",
        // To fix later.
        // TODO: The telemetry package and mixpanel package should expose an MSW handler.
        envOrTrackingApiBaseUrl: "msw"
    };
}

const telemetryClient = initializeTelemetry(telemetryOptions);
const activeModules = getActiveModules(process.env.MODULES);

const fireflyRuntime = initializeFirefly({
    mode: "development",
    useMsw: !!process.env.USE_MSW,
    localModules: [registerShell, registerHost, ...activeModules],
    startMsw: async runtime => {
        // Files that includes an import to the "msw" package are included dynamically to prevent adding
        // unused MSW stuff to the code bundles.
        return (await import("./startMsw.ts")).startMsw(runtime.requestHandlers);
    },
    environmentVariables,
    honeycombInstrumentationClient: telemetryClient.honeycomb,
    launchDarklyClient,
    loggers
});

const root = createRoot(document.getElementById("root")!);

root.render(
    <StrictMode>
        <FireflyProvider runtime={fireflyRuntime}>
            <QueryProvider>
                <App />
            </QueryProvider>
        </FireflyProvider>
    </StrictMode>
);
