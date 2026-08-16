import type { ModuleConfig } from "@adeficior/data-modifier-core";
import { gatherImports, gatherPromotions } from "./imports";
import { moduleTemplate } from "./typescript";
import { writeTemplate } from "./write";

function generateModule(modules: ModuleConfig[]) {
  const { services, hooks } = gatherImports(modules);
  const promotions = gatherPromotions(modules, services);

  return moduleTemplate(
    "@adeficior/data-modifier-core/generated",
    /* typescript */ `
      /* eslint-disable @typescript-eslint/consistent-type-imports */
      /* eslint-disable @typescript-eslint/no-unused-vars */
      
      export type Services<T extends ModuleTypes> = {
        ${services}
      }

      export type Hooks<T extends ModuleTypes> = {
        ${hooks}
      }

      export type Promotions = {
        ${promotions}
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
