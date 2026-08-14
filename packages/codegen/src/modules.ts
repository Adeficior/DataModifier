import type { ModuleConfig } from "@adeficior/data-modifier-core";
import { uniqBy } from "lodash-es";
import { exists } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

export async function findModuleIn(dir: string) {
  const candidates = [
    join(dir, "src", "module.ts"),
    join(dir, "dist", "module.js"),
  ];

  const match = (
    await Promise.all(candidates.map((it) => exists(it)))
  ).findIndex((it) => it);

  if (match < 0) {
    throw new Error(`could not find module in ${resolve(dir)}`);
  }

  return readModule(candidates[match]!);
}

export async function readModule(file: string) {
  const url = relative(import.meta.dirname, file);
  const exports = await import(url);
  return exports.default as ModuleConfig;
}

export async function loadDependencyModules(
  dir: string,
  dependencies: ModuleConfig["dependencies"],
  exclude: string[] = [],
): Promise<ModuleConfig[]> {
  if (exclude.includes(dir)) return [];

  const found = await Promise.all(
    Object.entries(dependencies).map(async ([name, type]) => {
      const dependencyDir = join(dir, "node_modules", name);
      const depenencyModule = await findModuleIn(dependencyDir);

      if (depenencyModule) {
        return [
          depenencyModule,
          ...(await loadDependencyModules(
            dependencyDir,
            depenencyModule.dependencies,
            [...exclude, dir],
          )),
        ];
      }

      const message = `missing ${type} dependency module '${name}'`;
      if (type === "required") throw new Error(message);
      return [];
    }),
  );

  return uniqBy(found.flat(), (it) => it.name);
}
