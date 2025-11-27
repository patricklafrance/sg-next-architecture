import "@squide/firefly";

// Module Augmentation of the EnvironmentVariables interface.
declare module "@squide/firefly" {
    interface EnvironmentVariables {
        hostApiBaseUrl: string;
        managementApiBaseUrl: string;
        migrationApiBaseUrl: string;
    }
}
