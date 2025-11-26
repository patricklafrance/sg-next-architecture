import "@squide/env-vars";

// Module Augmentation of the EnvironmentVariables interface.
declare module "@squide/env-vars" {
    interface EnvironmentVariables {
        hostApiBaseUrl: string;
        managementApiBaseUrl: string;
        migrationApiBaseUrl: string;
    }
}
