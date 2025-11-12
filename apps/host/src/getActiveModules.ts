import { registerManagement } from "@modules/management";
import { registerMigration } from "@modules/migration";
import type { FireflyRuntime, ModuleRegisterFunction } from "@squide/firefly";

const ModulesDefinition: Record<string, ModuleRegisterFunction<FireflyRuntime>> = {
    "management": registerManagement,
    "migration": registerMigration
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
