import { packFormatOf, type ModuleConfig } from "@adeficior/data-modifier-core";
import { exists } from "node:fs/promises";
import { join, relative } from "node:path";
import { generateTypes } from "./types";

export async function readModule(dir: string) {
  const moduleFile = join(dir, "src", "module.ts");
  if (!(await exists(moduleFile))) {
    console.warn("could not find module for", dir);
    return;
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
      else if (type === "optional") console.warn(message);
    }),
  );

  return found.filter((it) => !!it) as ModuleConfig[];
}

export async function generateModuleTypes(dir: string) {
  const dependencies = await getDependencies(dir);
  await generateTypes(dir, dependencies, {
    // TODO use actual pack format somehow
    packFormat: packFormatOf("1.21.1"),
  });
}
