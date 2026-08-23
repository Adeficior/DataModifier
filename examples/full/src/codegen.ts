import {
  generateModulesTypes,
  generateStubTypes,
  loadDependencyModules,
} from "@adeficior/data-modifier-codegen";
import { resolve } from "node:path";

const typesDir = resolve("@types");

const modules = await loadDependencyModules({
  "@adeficior/data-modifier": "required",
  "@adeficior/data-modifier-botania": "required",
  "@adeficior/data-modifier-create": "required",
  "@adeficior/data-modifier-content": "required",
  "@adeficior/data-modifier-farmersdelight": "required",
  "@adeficior/data-modifier-models": "required",
  "@adeficior/data-modifier-lang": "required",
  "@adeficior/data-modifier-thermal": "required",
});

await generateStubTypes(typesDir);
await generateModulesTypes(typesDir, modules);
