import { resolveDumpDir } from "@adeficior/data-modifier-core";
import type { DataModifierConfig } from "@adeficior/data-modifier-core";
import { loadModules } from "@adeficior/data-modifier-loader";
import { resolve } from "node:path";
import { generateDumpTypesFrom } from "./dump";
import { generateStubTypes } from "./stubs";
import { generateModulesTypes } from "./types";

export async function generateUsingConfig({
  codegen,
  dump,
  modules = [],
}: DataModifierConfig) {
  const loadedModules = await loadModules(modules);

  const typesDir = codegen?.typesDir ?? resolve("@types");

  const dumpResolver = await resolveDumpDir(dump);

  if (dumpResolver) {
    await generateDumpTypesFrom(dumpResolver, typesDir);
  } else {
    await generateStubTypes(typesDir);
  }

  await generateModulesTypes(typesDir, loadedModules);
}
