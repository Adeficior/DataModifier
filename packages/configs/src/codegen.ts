import { basename, dirname, join, resolve } from "node:path";
import { findModuleIn, loadDependencyModules } from "../../codegen/src/modules";
import { generateStubTypes } from "../../codegen/src/stubs";
import { generateModulesTypes } from "../../codegen/src/types";

export async function generateTypes(moduleDir: string) {
  const type = basename(dirname(resolve(moduleDir)));
  const typesDir = join(moduleDir, "@types");

  if (type === "packages") {
    await generateModulesTypes(typesDir, []);
  } else {
    const module = await findModuleIn(moduleDir);
    const dependencies = await loadDependencyModules(
      join(moduleDir, "node_modules"),
      module.dependencies,
    );
    await generateModulesTypes(typesDir, dependencies);
  }

  await generateStubTypes(typesDir);
}
