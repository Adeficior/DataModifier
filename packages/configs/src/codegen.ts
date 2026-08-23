import { basename, dirname, join, resolve } from "node:path";
import { generateStubTypes } from "../../codegen/src/stubs";
import { generateModulesTypes } from "../../codegen/src/types";
import { findModuleIn, loadDependencyModules } from "../../loader/src";

export async function generateTypes(moduleDir: string) {
  const type = basename(dirname(resolve(moduleDir)));
  const typesDir = join(moduleDir, "@types");

  if (type === "packages") {
    await generateModulesTypes(typesDir, []);
  } else {
    const module = await findModuleIn(moduleDir);
    const dependencies = await loadDependencyModules(
      module.dependencies,
      join(moduleDir),
    );
    await generateModulesTypes(typesDir, dependencies);
  }

  await generateStubTypes(typesDir);
}
