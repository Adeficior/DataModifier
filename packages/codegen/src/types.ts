import type { ModuleConfig } from "@adeficior/data-modifier-core";
import { gatherImports } from "./imports";
import { moduleTemplate } from "./typescript";
import { writeTemplate } from "./write";

function generateModule(modules: ModuleConfig[]) {
  const { services, hooks } = gatherImports(modules);

  return moduleTemplate(
    "@adeficior/data-modifier-core/generated",
    /* typescript */ `
      export type Services<T extends ModuleTypes> = {
        ${services}
      }

      export type Hooks<T extends ModuleTypes> = {
        ${hooks}
      }
    `,
  );
}

export async function generateModulesTypes(
  typesDir: string,
  modules: ModuleConfig[],
) {
  const servicesTypes = await generateModule(modules);
  await writeTemplate(typesDir, "modules", servicesTypes);
}
