import { RegistryDumpLoader } from "@adeficior/data-modifier-core";
import type { Resolver } from "@adeficior/pack-resolver";
import { createResolver } from "@adeficior/pack-resolver";
import { generateRegistryTypes } from "./registry";

export async function generateDumpTypes(typesDir: string) {
  await generateDumpTypesFrom(await createResolver({ from: "dump" }), typesDir);
}

export async function generateDumpTypesFrom(from: Resolver, typesDir: string) {
  const loader = new RegistryDumpLoader();
  await from.extract(loader);
  await generateRegistryTypes(typesDir, loader);
}
