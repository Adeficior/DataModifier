import type { Hooks } from "@adeficior/data-modifier-core/generated";
import packageJson from "../../package.json";
import { type PackLoaderOptions } from "../config";
import { type Container } from "../container";
import { type ClearableEmitter } from "../emit/abstract";
import { type Loader } from "../load/abstract";

export type DependencyType = "required" | "optional";

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

type CombinedHooks<T extends ModuleTypes> = Hooks & NonNullable<T["hooks"]>;

export type AfterSetupEvent<T extends ModuleTypes = ModuleTypes> = {
  callHook<K extends keyof CombinedHooks<T>>(
    type: K,
    event: CombinedHooks<T>[K],
  ): Promise<void>;
};

export type SetupEvent<T extends ModuleTypes = ModuleTypes> = {
  service: Registration<NonNullable<T["services"]>>;
  loader: Registration<NonNullable<T["loaders"]>, Loader, [string]>;
  emitter: Registration<NonNullable<T["emitters"]>, ClearableEmitter>;
  options: PackLoaderOptions;
  hook: <K extends keyof CombinedHooks<T>>(
    type: K,
    handler: EventHandler<CombinedHooks<T>[K]>,
  ) => void;
};

type ModuleImports<T extends ModuleTypes> = {
  services: Record<keyof NonNullable<T["services"]>, ImportOptions>;
  emitters: Record<keyof NonNullable<T["emitters"]>, ImportOptions>;
  loaders: Record<keyof NonNullable<T["loaders"]>, ImportOptions>;
  hooks: Record<keyof NonNullable<T["hooks"]>, ImportOptions>;
};

type PackagedModule = {
  importModule: string;
  name?: string;
};

type LocalModule = {
  name: string;
};

export type ModuleConfigInput<T extends ModuleTypes> = {
  dependencies?: Record<string, DependencyType>;
  setup?: EventHandler<SetupEvent<T>>;
  afterSetup?: EventHandler<AfterSetupEvent<T>>;
  types?: Partial<ModuleImports<T>>;
} & (PackagedModule | LocalModule);

export type ModuleConfig<T extends ModuleTypes = ModuleTypes> = {
  name: string;
  importModule?: string;
  dependencies: Record<string, DependencyType>;
  setup: EventHandler<SetupEvent<T>>;
  afterSetup: EventHandler<AfterSetupEvent<T>>;
  types: ModuleImports<T>;
};

export function defineModule<T extends ModuleTypes>({
  types,
  dependencies,
  ...config
}: ModuleConfigInput<T>): ModuleConfig<T> {
  const actualDependencies = { ...dependencies };
  const name = config.name ?? (config as PackagedModule).importModule;
  if (name !== packageJson.name) {
    actualDependencies[packageJson.name] = "required";
  }

  return {
    dependencies: actualDependencies,
    setup: () => {},
    afterSetup: () => {},
    types: {
      emitters: types?.emitters ?? {},
      loaders: types?.loaders ?? {},
      hooks: types?.hooks ?? {},
      services: types?.services ?? {},
    } as ModuleImports<T>,
    ...config,
    name,
  };
}
