import {
  CombinedEmitters,
  type Container,
  type EventHandler,
  type Loader,
  type ModuleConfig,
  type PackLoaderOptions,
  type SetupEvent,
} from "@adeficior/data-modifier-core";

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

    // TODO sort by dependencies or some shit
    const sorted = modules.toReversed();

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
