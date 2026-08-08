import { type ModuleConfig } from "@adeficior/data-modifier-core";
import { join } from "node:path";
import { gatherImports } from "./imports";
import { writeTemplate } from "./write";

function generateModule(modules: ModuleConfig[]) {
  const { services, hooks } = gatherImports(modules);

  return /* typescript */ `
    declare module "@adeficior/data-modifier-core/generated" {
      export type Services = {
        ${services}
      }

      export type Hooks = {
        ${hooks}
      }
    }
  `;
}

export async function generateTypes(dir: string, modules: ModuleConfig[]) {
  const servicesTypes = generateModule(modules);
  const typesDir = join(dir, "@types");
  await writeTemplate(typesDir, "modules", servicesTypes);
}
