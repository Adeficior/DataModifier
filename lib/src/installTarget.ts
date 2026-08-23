import type {
  AfterSetupEvent,
  DependencyType,
  EventHandler,
  Loader,
  ModuleConfig,
  ModulesContainer,
  ModuleSetupOptions,
  ModuleType,
  ModuleTypes,
  SetupEvent,
} from "@adeficior/data-modifier-core";
import { CombinedEmitters } from "@adeficior/data-modifier-core";
import { uniqBy } from "lodash-es";

export type Installable = {
  name: string;
  dependencies: Record<string, DependencyType>;
};

function directDependencies(
  module: Installable,
  others: Installable[],
): ReadonlyArray<Installable> {
  const direct = Object.keys(module.dependencies);

  if (module.name && direct.includes(module.name)) {
    throw new Error(`module ${module.name} cannot depend on itself`);
  }

  return direct.map((name) => {
    const match = others.find((it) => it.name === name);
    if (match) return match;
    // TODO skip optional
    throw new Error(`unable to find module ${name} required by ${module.name}`);
  });
}

function recursiveDependencies(
  module: Installable,
  others: Installable[],
  path: string[],
): ReadonlyArray<Installable> {
  const direct = directDependencies(module, others);
  // TODO check path for recursive dependency cycles
  return uniqBy(
    [
      ...direct,
      ...direct.flatMap((it) =>
        recursiveDependencies(it, others, [...path, it.name]),
      ),
    ],
    (it) => it.name,
  );
}

export function resolveDependencies(
  module: Installable,
  others: Installable[],
) {
  return recursiveDependencies(module, others, [module.name]);
}

export function sortModules<T extends Installable>(modules: T[]): T[] {
  const withDependencies = modules.map((module) => ({
    module,
    dependencies: resolveDependencies(module, modules).map((it) => it.name),
  }));
  return withDependencies
    .toSorted((a, b) => {
      if (a.dependencies.includes(b.module.name)) return 1;
      if (b.dependencies.includes(a.module.name)) return -1;
      return a.dependencies.length - b.dependencies.length;
    })
    .map((it) => it.module);
}

class EventBus {
  private readonly handlers = new Map<string, Set<EventHandler<unknown>>>();

  subscribe(type: string, handler: EventHandler<unknown>) {
    const set = this.handlers.get(type);
    if (set) set.add(handler);
    else this.handlers.set(type, new Set([handler]));
  }

  async dispatch(type: string, event: unknown) {
    const handlers = [...(this.handlers.get(type) ?? [])];
    await Promise.all(handlers.map((handle) => handle(event)));
  }
}

export class InstallTarget implements ModulesContainer {
  private frozen = false;
  private readonly services = new Map<string, unknown>();
  protected readonly emitters = new CombinedEmitters();
  protected readonly loaders: Record<string, Loader> = {};

  constructor(protected readonly options: ModuleSetupOptions) {}

  get<T>(key: string): T {
    const instance = this.getOrNull<T>(key);
    if (instance) return instance;
    throw new Error(`no instance of type '${key}' registered`);
  }

  getOrNull<T>(key: string): T | null {
    return this.services.get(key) as T | null;
  }

  async install(
    modules: ModuleConfig[],
    options: ModuleType<ModuleTypes, "options">,
  ) {
    if (this.frozen) {
      throw new Error(
        "installation cannot happen after modifier has been created",
      );
    }

    const bus = new EventBus();

    const sorted = sortModules(modules);

    for (const module of sorted) {
      const combinedOptions = { ...this.options, ...options };

      const event: SetupEvent = {
        hook: (type, handler) =>
          bus.subscribe(type, handler as EventHandler<unknown>),
        service: (key, factory) => {
          const instance = factory(this);
          this.services.set(key, instance);
          return () => instance;
        },
        emitter: (key, factory) => {
          const instance = event.service(`emitter:${key}`, factory);
          this.emitters.add(instance());
          return instance;
        },
        loader: (key, factory, pattern) => {
          const instance = event.service(`loader:${key}`, factory);
          this.loaders[pattern] = instance();
          return instance;
        },
        options: combinedOptions,
      };

      await module.setup(event);
    }

    this.frozen = true;
    bus.dispatch("setup:after", {
      callHook: (...args) => bus.dispatch(...args),
    } satisfies AfterSetupEvent);
  }
}
