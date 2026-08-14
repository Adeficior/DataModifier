import { RegistryDumpLoader } from "@adeficior/data-modifier-core";
import { createResolver, type Resolver } from "@adeficior/pack-resolver";
import { join } from "node:path";
import { generateRegistryTypes } from "./registry";

export async function generateDumpTypes(dir: string) {
  await generateDumpTypesFrom(await createResolver({ from: "dump" }), dir);
}

export async function generateDumpTypesFrom(from: Resolver, dir: string) {
  const loader = new RegistryDumpLoader();
  await from.extract(loader);
  await generateRegistryTypes(loader, join(dir, "@types", "registry.d.ts"));
}
