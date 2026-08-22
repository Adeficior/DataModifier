import {
  generateModulesTypes,
  generateStubTypes,
  loadDependencyModules,
} from "@adeficior/data-modifier-codegen";
import { resolve } from "node:path";

const typesDir = resolve("@types");

const modules = await loadDependencyModules({
  "@adeficior/data-modifier": "required",
});

await generateStubTypes(typesDir);
await generateModulesTypes(typesDir, modules);
