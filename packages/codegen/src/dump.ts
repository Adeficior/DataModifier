import { createDumpLookup } from "@adeficior/data-modifier-core";
import type { ModuleConfig } from "@adeficior/data-modifier-core";
import type { Resolver } from "@adeficior/pack-resolver";
import { createResolver } from "@adeficior/pack-resolver";
import { generateRegistryTypes } from "./registry";

export async function generateDumpTypes(
  typesDir: string,
  modules: ModuleConfig[] = [],
) {
  await generateDumpTypesFrom(
    await createResolver({ from: "dump" }),
    typesDir,
    modules,
  );
}

export async function generateDumpTypesFrom(
  from: Resolver,
  typesDir: string,
  modules: ModuleConfig[] = [],
) {
  const lookup = await createDumpLookup(from);
  await generateRegistryTypes(typesDir, lookup, modules);
}
