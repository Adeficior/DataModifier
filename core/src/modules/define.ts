import type { PackLoaderOptions } from "../config";
import type { Container } from "../container";
import type { ClearableEmitter } from "../emit/abstract";
import type { Loader } from "../load/abstract";

type SetupEvent<T> = Container & {
  register<R extends T>(key: string, loader: R): R;
  options: PackLoaderOptions;
};

export type SetupLoadersEvent = SetupEvent<Loader>;

export type SetupEmittersEvent = SetupEvent<ClearableEmitter>;

type EventHandler<T> = (event: T) => Promise<void> | void;

export type ModuleConfig = {
  setupLoaders?: EventHandler<SetupLoadersEvent>;
  setupEmitters?: EventHandler<SetupEmittersEvent>;
};

export function defineModule(_config: ModuleConfig) {}
