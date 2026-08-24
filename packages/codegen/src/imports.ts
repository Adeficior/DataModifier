import type {
  ImportOptions,
  ImportRewriter,
  ModuleConfig,
  ResolvedImport,
} from "@adeficior/data-modifier-core";
import { notNull, uniq } from "@adeficior/pack-resolver";

class ImportUnresolvableError extends Error {
  constructor(
    readonly input: ImportOptions,
    readonly target?: string,
    options?: ErrorOptions,
  ) {
    const suffix = target ? ` for ${target}` : "";
    super("unable to resolve import" + suffix, options);
  }
}

function resolveImport(
  options: ImportOptions,
  fallbackModule: string | undefined,
): ResolvedImport | null {
  const name = typeof options === "string" ? options : options.name;
  const module =
    (typeof options === "string" ? null : options.module) ?? fallbackModule;
  const path = typeof options === "string" ? undefined : options.path;

  if (name && module) {
    return { module, name, path };
  }

  throw new ImportUnresolvableError(options);
}

function importStatement(it: ResolvedImport) {
  if (it.path) {
    return `import("${it.module}/${it.path}").${it.name}`;
  }
  return `import("${it.module}").${it.name}`;
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
    try {
      const resolved = resolveImport(options, fallbackModule);
      if (resolved) this.add(key, resolved);
    } catch (cause) {
      if (cause instanceof ImportUnresolvableError) {
        throw new ImportUnresolvableError(cause.input, key, { cause });
      } else {
        throw cause;
      }
    }
  }

  get(key: string) {
    return this.entries.get(key);
  }

  rewrite(strategy: ImportRewriter) {
    const rewritten = new ImportMap();
    this.entries.forEach((value, key) => {
      rewritten.add(key, strategy(value));
    });
    return rewritten;
  }

  toString() {
    return this.entries
      .entries()
      .map(([key, options]) => ({ key, ...options }))
      .toArray()
      .map((it) => `"${it.key}": ${importStatement(it)}`)
      .join("\n");
  }
}

function rewrite(map: ImportMap, modules: ModuleConfig[]): ImportMap {
  const strategies = modules.map((it) => it.types.rewrite);
  return strategies.reduce(
    (previous, strategy) => previous.rewrite(strategy),
    map,
  );
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

  return {
    services: rewrite(services, modules),
    hooks: rewrite(hooks, modules),
  };
}

class Promotions {
  private entries = new Map<string, ResolvedImport>();
  private subPromotions = new Map<string, Promotions>();

  add([key, ...path]: string[], resolvedImport: ResolvedImport) {
    if (!key) return;

    if (path.length === 0) {
      this.entries.set(key, resolvedImport);
    } else {
      if (!this.subPromotions.has(key)) {
        this.subPromotions.set(key, new Promotions());
      }
      this.subPromotions.get(key)!.add(path, resolvedImport);
    }
  }

  toString() {
    const keys = uniq([...this.entries.keys(), ...this.subPromotions.keys()]);

    return keys
      .map((key) => {
        const rootImport = this.entries.get(key);
        const rootType = rootImport && importStatement(rootImport);

        const subPromotions = this.subPromotions.get(key);
        const subType = subPromotions && `{ ${subPromotions} }`;

        const type = [rootType, subType].filter(notNull).join("&");
        return `"${key}": ${type}`;
      })
      .join("\n");
  }
}

export function gatherPromotions(modules: ModuleConfig[], services: ImportMap) {
  const promotions = new Promotions();

  modules.forEach(({ promote }) => {
    promote.forEach((options) => {
      const resolvedImport = services.get(options.service);
      if (!resolvedImport) return;
      promotions.add(options.path, resolvedImport);
    });
  });

  return promotions;
}
