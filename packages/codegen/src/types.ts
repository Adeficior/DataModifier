import type { ModuleConfig } from "@adeficior/data-modifier-core";
import { gatherImports } from "./imports";
import { writeTemplate } from "./write";

function generateModule(modules: ModuleConfig[]) {
  const { services, hooks } = gatherImports(modules);

  return /* typescript */ `
    declare module "@adeficior/data-modifier-core/generated" {
      export type Services<T extends ModuleTypes> = {
        ${services}
      }

      export type Hooks<T extends ModuleTypes> = {
        ${hooks}
      }
    }
  `;
}

export async function generateModulesTypes(
  typesDir: string,
  modules: ModuleConfig[],
) {
  const servicesTypes = generateModule(modules);
  await writeTemplate(typesDir, "modules", servicesTypes);
}
