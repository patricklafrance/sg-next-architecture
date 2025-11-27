import { registerManagement } from "@home-modules/management";
import { registerMigration } from "@home-modules/migration";
import type { FireflyRuntime, ModuleRegisterFunction } from "@squide/firefly";

const ModulesDefinition: Record<string, ModuleRegisterFunction<FireflyRuntime>> = {
    "home/management": registerManagement,
    "home/migration": registerMigration
};

export function getActiveModules(activeModules?: string) {
    if (!activeModules) {
        // Return all the modules.
        return Object.values(ModulesDefinition);
    }

    return Object.keys(ModulesDefinition).reduce((acc, x: keyof typeof ModulesDefinition) => {
        if (activeModules.includes(x)) {
            acc.push(ModulesDefinition[x]);
        }

        return acc;
    }, [] as ModuleRegisterFunction<FireflyRuntime>[]);
}
