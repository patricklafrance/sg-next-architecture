import "@squide/firefly";

// Module Augmentation of the FeatureFlags interface.
declare module "@squide/firefly" {
    interface FeatureFlags {
        "enable-log-rocket": boolean;
        "enable-honeycomb": boolean;
        "enable-mixpanel": boolean;
    }
}
