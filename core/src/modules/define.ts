import type { Hooks } from "@adeficior/data-modifier-core/generated";
import packageJson from "../../package.json";
import type { ModuleSetupOptions } from "../config";
import type { Container } from "../container";
import type { ClearableEmitter } from "../emit/abstract";
import type { Loader } from "../load/abstract";

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
  // TODO these need to force being nullable
  // or modules need to provide default values
  options?: Record<string, unknown>;
  services?: Record<string, unknown>;
  emitters?: Record<string, unknown>;
  loaders?: Record<string, unknown>;
  hooks?: Record<string, unknown>;
};

export type ModuleType<
  T extends ModuleTypes,
  TKey extends keyof ModuleTypes,
> = NonNullable<T[TKey]>;

export type ModuleHooks<T extends ModuleTypes> = Hooks<T> &
  ModuleType<T, "hooks">;

//  export type ModuleServices<T extends ModuleTypes> = Services<T> & ModuleType<T, "services">;

export type AfterSetupEvent<T extends ModuleTypes = ModuleTypes> = {
  callHook<K extends keyof ModuleHooks<T>>(
    type: K,
    event: ModuleHooks<T>[K],
  ): Promise<void>;
};

export type SetupEvent<T extends ModuleTypes = ModuleTypes> = {
  service: Registration<ModuleType<T, "services">>;
  loader: Registration<ModuleType<T, "loaders">, Loader, [string]>;
  emitter: Registration<ModuleType<T, "emitters">, ClearableEmitter>;
  options: ModuleSetupOptions & ModuleType<T, "options">;
  hook: <K extends keyof ModuleHooks<T>>(
    type: K,
    handler: EventHandler<ModuleHooks<T>[K]>,
  ) => void;
};

type ModuleImports<T extends ModuleTypes> = {
  options: ImportOptions;
  services: Record<keyof ModuleType<T, "services">, ImportOptions>;
  emitters: Record<keyof ModuleType<T, "emitters">, ImportOptions>;
  loaders: Record<keyof ModuleType<T, "loaders">, ImportOptions>;
  hooks: Record<keyof ModuleType<T, "hooks">, ImportOptions>;
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
