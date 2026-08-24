import type { DataModifierConfig } from "@adeficior/data-modifier-core";
import { resolveDumpDir } from "@adeficior/data-modifier-core";
import { loadModules } from "@adeficior/data-modifier-loader";
import { resolve } from "node:path";
import { generateDumpTypesFrom } from "./dump";
import { generateStubTypes } from "./stubs";
import { generateModulesTypes } from "./types";

type CodeGenConfig = Required<DataModifierConfig["codegen"]>;

export async function generateUsingConfig({
  codegen,
  dump,
  modules = [],
  logger,
}: DataModifierConfig) {
  const loadedModules = await loadModules(modules, { optional: true });

  const { typesDir, moduleTypes, registryTypes } = {
    typesDir: resolve("@types"),
    moduleTypes: true,
    registryTypes: true,
    ...codegen,
  } satisfies CodeGenConfig;

  if (registryTypes !== false) {
    const dumpResolver = await resolveDumpDir(dump);

    if (dumpResolver && registryTypes !== "stubs") {
      logger?.info("generated registry types using dump");
      await generateDumpTypesFrom(dumpResolver, typesDir);
    } else {
      if (registryTypes === "dump") {
        throw new Error("unable to locate registry dump");
      }

      logger?.info("generated stub registry types");
      await generateStubTypes(typesDir);
    }
  }

  if (moduleTypes) {
    logger?.info("generated module types");
    await generateModulesTypes(typesDir, loadedModules);
  }
}
