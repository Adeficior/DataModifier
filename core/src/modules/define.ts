import { type PackLoaderOptions } from "../config";
import { type Container } from "../container";
import { type ClearableEmitter } from "../emit/abstract";
import { type Loader } from "../load/abstract";

export type ImportOptions =
  | string
  | {
      module?: string;
      name?: string;
    };

export type ServiceOptions = {
  import?: ImportOptions;
};

type Registration<
  TTypes extends Record<string, unknown>,
  TAbstract = unknown,
  TArgs extends unknown[] = [],
> = <TKey extends keyof TTypes, TImpl extends TTypes[TKey] & TAbstract>(
  key: TKey,
  factory: (container: Container) => TImpl,
  ...args: TArgs
) => () => TImpl;

export type EventHandler<T> = (event: T) => Promise<void> | void;

export type ModuleTypes = {
  services?: Record<string, unknown>;
  emitters?: Record<string, unknown>;
  loaders?: Record<string, unknown>;
  hooks?: Record<string, unknown>;
};

export type SetupEvent<T extends ModuleTypes = ModuleTypes> = {
  service: Registration<NonNullable<T["services"]>>;
  loader: Registration<NonNullable<T["loaders"]>, Loader, [string]>;
  emitter: Registration<NonNullable<T["emitters"]>, ClearableEmitter>;
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

export type DependencyType = "required" | "optional";

type ModuleImports<T extends ModuleTypes> = {
  services: Record<keyof NonNullable<T["services"]>, ImportOptions>;
  emitters: Record<keyof NonNullable<T["emitters"]>, ImportOptions>;
  loaders: Record<keyof NonNullable<T["loaders"]>, ImportOptions>;
  hooks: Record<keyof NonNullable<T["hooks"]>, ImportOptions>;
};

export type ModuleConfigInput<T extends ModuleTypes> = {
  importModule?: string;
  dependencies?: Record<string, DependencyType>;
  setup?: EventHandler<SetupEvent<T>>;
  types?: Partial<ModuleImports<T>>;
};

export type ModuleConfig<T extends ModuleTypes = ModuleTypes> = {
  importModule?: string;
  dependencies: Record<string, DependencyType>;
  setup: EventHandler<SetupEvent<T>>;
  types: ModuleImports<T>;
};

export function defineModule<T extends ModuleTypes>({
  types,
  dependencies,
  ...config
}: ModuleConfigInput<T>): ModuleConfig<T> {
  return {
    dependencies: {
      "@adeficior/data-modifier-core": "required",
      ...dependencies,
    },
    setup: () => {},
    types: {
      emitters: types?.emitters ?? {},
      loaders: types?.loaders ?? {},
      hooks: types?.hooks ?? {},
      services: types?.services ?? {},
    } as ModuleImports<T>,
    ...config,
  };
}
