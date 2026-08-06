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

export type SetupEvent = {
  service: Registration;
  loader: Registration<Loader>;
  emitter: Registration<ClearableEmitter>;
  options: PackLoaderOptions;
};

type EventHandler<T> = (event: T) => Promise<void> | void;

export type ModuleConfig = {
  importModule?: string;
  setup?: EventHandler<SetupEvent>;
};

export function defineModule(config: ModuleConfig): ModuleConfig {
  return config;
}
