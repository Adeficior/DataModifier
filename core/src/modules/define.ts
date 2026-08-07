import type { PackLoaderOptions } from "../config";
import type { Container } from "../container";
import type { ClearableEmitter } from "../emit/abstract";
import type { Loader } from "../load/abstract";

export type ImportOptions = {
  module?: string;
  name?: string;
};

export type ServiceOptions = {
  import?: ImportOptions;
};

type Registration<T = unknown> = <R extends T>(
  key: string,
  factory: (container: Container) => R,
  options?: ServiceOptions,
) => () => R;

export type SetupEvent<T extends ModuleTypes = ModuleTypes> = {
  service: Registration;
  loader: Registration<Loader>;
  emitter: Registration<ClearableEmitter>;
  options: PackLoaderOptions;
  hook: <K extends keyof T["hooks"]>(
    type: K,
    handler: EventHandler<T["hooks"][K]>,
  ) => void;
  callHook<K extends keyof T["hooks"]>(
    type: K,
    event: T["hooks"][K],
  ): Promise<void>;
};

type EventHandler<T> = (event: T) => Promise<void> | void;

export type ModuleTypes = {
  hooks: Record<string, unknown>;
};

export type DependencyType = "required" | "optional";

export type ModuleConfig<T extends ModuleTypes = ModuleTypes> = {
  importModule?: string;
  dependencies?: Record<string, DependencyType>;
  setup?: EventHandler<SetupEvent<T>>;
  hooks?: Record<keyof T["hooks"], ImportOptions>;
};

export function defineModule<T extends ModuleTypes>(
  config: ModuleConfig<T>,
): ModuleConfig<T> {
  return config;
}
