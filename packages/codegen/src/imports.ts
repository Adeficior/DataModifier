import {
  type ImportOptions,
  type ModuleConfig,
} from "@adeficior/data-modifier-core";

type ResolvedImport = {
  name: string;
  module: string;
};

function resolveImport(
  options: ImportOptions,
  fallbackModule: string | undefined,
): ResolvedImport | null {
  const name = typeof options === "string" ? options : options.name;
  const module =
    (typeof options === "string" ? null : options.module) ?? fallbackModule;

  if (name && module) {
    return { name, module };
  }

  return null;
}

class ImportMap {
  private entries = new Map<string, ResolvedImport>();

  add(key: string, options: ImportOptions, fallbackModule: string | undefined) {
    const resolved = resolveImport(options, fallbackModule);
    if (resolved) this.entries.set(key, resolved);
  }

  toString() {
    return this.entries
      .entries()
      .map(([key, options]) => ({ key, ...options }))
      .toArray()
      .map((it) => `"${it.key}": import("${it.module}").${it.name};`)
      .join("\n");
  }
}

export function gatherImports(modules: ModuleConfig[]) {
  const services = new ImportMap();
  const hooks = new ImportMap();

  modules.forEach(({ importModule, types }) => {
    Object.entries(types.services).forEach(([key, options]) =>
      services.add(key, options, importModule),
    );
    Object.entries(types.loaders).forEach(([key, options]) =>
      services.add(`loader:${key}`, options, importModule),
    );
    Object.entries(types.emitters).forEach(([key, options]) =>
      services.add(`emitter:${key}`, options, importModule),
    );
    Object.entries(types.hooks).forEach(([key, options]) =>
      hooks.add(key, options, importModule),
    );
  });

  return { services, hooks };
}
