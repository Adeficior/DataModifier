import {
  CombinedEmitters,
  type Container,
  type DependencyType,
  type EventHandler,
  type Loader,
  type ModuleConfig,
  type PackLoaderOptions,
  type SetupEvent,
} from "@adeficior/data-modifier-core";
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
    this.handlers.getOrInsertComputed(type, () => new Set()).add(handler);
  }

  async dispatch(type: string, event: unknown) {
    const handlers = [...(this.handlers.get(type) ?? [])];
    await Promise.all(handlers.map((handle) => handle(event)));
  }
}

export class InstallTarget implements Container {
  private readonly services = new Map<string, unknown>();
  protected readonly emitters = new CombinedEmitters();
  protected readonly loaders: Record<string, Loader> = {};

  get(key: string) {
    const instance = this.getOrNull(key);
    if (instance) return instance;
    throw new Error(`no instance of type '${key}' registered`);
  }

  getOrNull(key: string) {
    return this.services.get(key);
  }

  async install(options: PackLoaderOptions, ...modules: ModuleConfig[]) {
    const bus = new EventBus();

    const sorted = sortModules(modules);

    Promise.all(
      sorted.map(async (it) => {
        const event: SetupEvent = {
          hook: (...args) => bus.subscribe(...args),
          callHook: (...args) => bus.dispatch(...args),
          service: (key, factory) => {
            const instance = factory(this);
            this.services.set(key, instance);
            return () => instance;
          },
          emitter: (key, factory) => {
            const instance = event.service(key, factory);
            this.emitters.add(instance());
            return instance;
          },
          loader: (key, factory, pattern) => {
            const instance = event.service(key, factory);
            this.loaders[pattern] = instance();
            return instance;
          },
          options,
        };

        await it.setup(event);
      }),
    );
  }
}
