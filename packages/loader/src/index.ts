import type { ModuleConfig } from "@adeficior/data-modifier-core";
import { uniqBy } from "lodash-es";
import { exists } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

export type ModuleLoaderOptions = {
  optional: boolean;
  root?: string;
};

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

type ModuleResolutionStrategy = (name: string) => Promise<string>;

function resolveModuleIn(...folders: string[]): ModuleResolutionStrategy {
  return async (name) => {
    const candidates = folders.map((nodeModules) => join(nodeModules, name));
    for (const candidate of candidates) {
      if (await exists(candidate)) {
        return candidate;
      }
    }

    throw new Error("module does not exist in any folder");
  };
}

async function loadDependencyModulesRecursive(
  nodeModules: string[],
  dependencies: ModuleConfig["dependencies"],
  options: ModuleLoaderOptions,
  exclude: string[],
): Promise<ModuleConfig[]> {
  const found = await Promise.all(
    Object.entries(dependencies).map(async ([name, type]) => {
      if (options.optional === false && type === "optional") return [];

      const strategy = resolveModuleIn(...nodeModules);
      const dependencyDir = await strategy(name);
      const dependencyModule = await findModuleIn(dependencyDir);

      if (exclude.includes(name)) return [];

      if (dependencyModule) {
        return [
          dependencyModule,
          ...(await loadDependencyModulesRecursive(
            [...nodeModules, join(dependencyDir, "node_modules")],
            dependencyModule.dependencies,
            options,
            [...exclude, name],
          )),
        ];
      }

      const message = `missing ${type} dependency module '${name}'`;
      if (type === "required") throw new Error(message);
      return [];
    }),
  );

  return found.flat();
}

export function loadDependencyModules(
  dependencies: ModuleConfig["dependencies"],
  options: ModuleLoaderOptions,
) {
  return loadDependencyModulesRecursive(
    [join(options.root ?? ".", "node_modules")],
    dependencies,
    options,
    [],
  );
}

async function loadModule(
  module: string | ModuleConfig,
  options: ModuleLoaderOptions,
) {
  if (typeof module === "string")
    return loadDependencyModules({ [module]: "required" }, options);

  return [
    module,
    ...(await loadDependencyModules(module.dependencies, options)),
  ];
}

export async function loadModules(
  modules: (string | ModuleConfig)[],
  options: ModuleLoaderOptions,
) {
  const withLib = ["@adeficior/data-modifier", ...modules];

  const loaded = await Promise.all(
    withLib.map((it) => loadModule(it, options)),
  );

  return uniqBy(loaded.flat(), (it) => it.name);
}
