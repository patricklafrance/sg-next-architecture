import "./index.css";

import { getEnvironmentVariables, registerShell } from "@packages/core-module";
import { FireflyProvider, initializeFirefly } from "@squide/firefly";
import { BrowserConsoleLogger, RootLogger } from "@workleap/logging";
import { LogRocketLogger } from "@workleap/logrocket";
import { initializeTelemetry, InitializeTelemetryOptions } from "@workleap/telemetry";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { getActiveModules } from "./getActiveModules.ts";
import { QueryProvider } from "./QueryProvider.tsx";
import { registerHost } from "./registerHost.tsx";

const environmentVariables = getEnvironmentVariables("msw");

const loggers: RootLogger[] = [new BrowserConsoleLogger()];

if (process.env.LOGROCKET_APP_ID) {
    loggers.push(new LogRocketLogger());
}

const telemetryOptions: InitializeTelemetryOptions = {
    mixpanel: {
        productId: "sharegate",
        // To fix later.
        // TODO: The telemetry package and mixpanel package should expose an MSW handler.
        envOrTrackingApiBaseUrl: "msw"
    },
    verbose: true,
    loggers
};

if (process.env.HONEYCOMB_API_KEY) {
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

if (process.env.LOGROCKET_APP_ID) {
    telemetryOptions.logRocket = {
        appId: process.env.LOGROCKET_APP_ID
    };
} else {
    console.warn("[host] Cannot register LogRocket instrumentation because the LOGROCKET_APP_ID environment variable has not been configured.");
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
