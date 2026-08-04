import type { PackLoaderOptions } from "../config";
import type { ClearableEmitter } from "../emit/abstract";
import type { Loader } from "../load/abstract";

type SetupEvent<T> = {
  options: PackLoaderOptions;
  register<R extends T>(key: string, loader: R): R;
  get<R>(key: string): R;
  getOrNull<R>(key: string): R | null;
};

export type SetupLoadersEvent = SetupEvent<Loader>;

export type SetupEmittersEvent = SetupEvent<ClearableEmitter>;

type EventHandler<T> = (event: T) => Promise<void> | void;

export type ModuleConfig = {
  setupLoaders?: EventHandler<SetupLoadersEvent>;
  setupEmitters?: EventHandler<SetupEmittersEvent>;
};

export function defineModule(config: ModuleConfig) {}
