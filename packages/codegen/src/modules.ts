import type { ModuleConfig } from "@adeficior/data-modifier-core";
import { exists } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { generateModulesTypes } from "./types";

export async function readModule(dir: string) {
  const moduleFile = join(dir, "src", "module.ts");
  if (!(await exists(moduleFile))) {
    throw new Error(`could not find module in ${resolve(dir)}`);
  }

  const url = relative(import.meta.dirname, moduleFile);
  const exports = await import(url);
  return exports.default as ModuleConfig;
}

export async function getDependencies(dir: string) {
  const module = await readModule(dir);
  const dependencies = module?.dependencies ?? {};
  const found = await Promise.all(
    Object.entries(dependencies).map(async ([name, type]) => {
      const depenencyDir = join(dir, "node_modules", name);
      const depenencyModule = await readModule(depenencyDir);
      if (depenencyModule) return depenencyModule;

      const message = `missing ${type} dependency module '${name}'`;
      if (type === "required") throw new Error(message);
    }),
  );

  return found.filter((it) => !!it) as ModuleConfig[];
}

export async function generateModuleTypes(
  moduleDir: string,
  typesDir = join(moduleDir, "@types"),
) {
  const dependencies = await getDependencies(moduleDir);
  await generateModulesTypes(typesDir, dependencies);
}

export async function generateModuleStubTypes(typesDir: string) {
  await generateModulesTypes(typesDir, []);
}
