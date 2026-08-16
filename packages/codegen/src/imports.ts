import type {
  ImportOptions,
  ModuleConfig,
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

  add(key: string, resolved: ResolvedImport) {
    this.entries.set(key, resolved);
  }

  resolve(
    key: string,
    options: ImportOptions,
    fallbackModule: string | undefined,
  ) {
    const resolved = resolveImport(options, fallbackModule);
    if (resolved) this.add(key, resolved);
  }

  get(key: string) {
    return this.entries.get(key);
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
      services.resolve(key, options, importModule),
    );

    Object.entries(types.loaders).forEach(([key, options]) =>
      services.resolve(`loader:${key}`, options, importModule),
    );

    Object.entries(types.emitters).forEach(([key, options]) =>
      services.resolve(`emitter:${key}`, options, importModule),
    );

    Object.entries(types.hooks).forEach(([key, options]) =>
      hooks.resolve(key, options, importModule),
    );
  });

  return { services, hooks };
}

class Promotions {
  private entries = new Map<string, ImportMap>();

  add(target: string, key: string, resolvedImport: ResolvedImport) {
    this.entries
      .getOrInsertComputed(target, () => new ImportMap())
      .add(key, resolvedImport);
  }

  toString() {
    return [...this.entries.entries()]
      .map(([target, imports]) => `"${target}": { ${imports} }`)
      .join("\n");
  }
}

export function gatherPromotions(
  modules: Pick<ModuleConfig, "promote">[],
  services: ImportMap,
) {
  const promotions = new Promotions();

  modules.forEach(({ promote }) => {
    promote.forEach((options) => {
      const resolvedImport = services.get(options.service);
      if (!resolvedImport) return;
      promotions.add(options.target, options.key, resolvedImport);
    });
  });

  return promotions;
}
