import { basename, dirname, join, resolve } from "node:path";
import type { ModuleConfig } from "../../../core/src/modules/define";
import { generateStubTypes } from "../../codegen/src/stubs";
import { generateModulesTypes } from "../../codegen/src/types";
import { findModuleIn, loadModule } from "../../loader/src";

async function generateTypesIn(typesDir: string, modules: ModuleConfig[]) {
  await generateModulesTypes(typesDir, modules);
  await generateStubTypes(typesDir, modules, false);
}

export async function generateTypes(moduleDir: string) {
  const type = basename(dirname(resolve(moduleDir)));
  const typesDir = join(moduleDir, "@types");

  if (type === "packages") {
    await generateTypesIn(typesDir, []);
  } else {
    const module = await findModuleIn(moduleDir);
    const dependencies = await loadModule(module, {
      optional: true,
      root: moduleDir,
    });

    await generateTypesIn(typesDir, dependencies);
  }
}
