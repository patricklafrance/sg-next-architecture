import { EnvironmentVariables } from "@squide/firefly";

export type Environment = "msw";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getEnvironmentVariables(env: Environment) {
    return {
        hostApiBaseUrl: "/host/api",
        managementApiBaseUrl: "/management/api",
        migrationApiBaseUrl: "/migration/api"
    } satisfies EnvironmentVariables;
}
