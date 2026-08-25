import type { Hooks } from "@adeficior/data-modifier-core/generated";
import packageJson from "../../package.json";
import type { IdInput } from "../common/id";
import type { ModuleSetupOptions } from "../config";
import type { ModulesContainer } from "../container";
import type { ClearableEmitter } from "../emit/abstract";
import type { Loader } from "../load/abstract";

export type DependencyType = "required" | "optional";

export type ResolvedImport = {
  name: string;
  module: string;
  path?: string;
};

export type ImportOptions =
  | string
  | {
      module?: string;
      name?: string;
      path?: string;
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
  factory: (container: ModulesContainer) => TImpl,
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

export type ImportRewriter = (options: ResolvedImport) => ResolvedImport;

type ModuleImports<T extends ModuleTypes> = {
  options: ImportOptions;
  services: Record<keyof ModuleType<T, "services">, ImportOptions>;
  emitters: Record<keyof ModuleType<T, "emitters">, ImportOptions>;
  loaders: Record<keyof ModuleType<T, "loaders">, ImportOptions>;
  hooks: Record<keyof ModuleType<T, "hooks">, ImportOptions>;
  registries: IdInput[];
  rewrite: ImportRewriter;
};

type PackagedModule = {
  importModule: string;
  name?: string;
};

type LocalModule = {
  name: string;
};

export type ServiceKey<T extends ModuleTypes> =
  | keyof ModuleType<T, "services">
  | `emitter:${keyof ModuleType<T, "emitters"> & string}`
  | `loaders:${keyof ModuleType<T, "loaders"> & string}`;

export type ServicePromotionInput<T extends ModuleTypes = ModuleTypes> = {
  service: ServiceKey<T>;
  key: string;
};

export type ServicePromotion<T extends ModuleTypes = ModuleTypes> = {
  service: ServiceKey<T>;
  path: string[];
};

export type ModuleConfigInput<T extends ModuleTypes> = {
  dependencies?: Record<string, DependencyType>;
  setup?: EventHandler<SetupEvent<T>>;
  afterSetup?: EventHandler<AfterSetupEvent<T>>;
  types?: Partial<ModuleImports<T>>;
  promote?: ServicePromotionInput<T>[];
} & (PackagedModule | LocalModule);

export type ModuleConfig<T extends ModuleTypes = ModuleTypes> = {
  name: string;
  importModule?: string;
  dependencies: Record<string, DependencyType>;
  setup: EventHandler<SetupEvent<T>>;
  afterSetup: EventHandler<AfterSetupEvent<T>>;
  types: ModuleImports<T>;
  promote: ServicePromotion<T>[];
};

export function defineModule<T extends ModuleTypes>({
  types,
  dependencies,
  promote,
  ...config
}: ModuleConfigInput<T>): ModuleConfig<T> {
  const actualDependencies = { ...dependencies };
  const name = config.name ?? (config as PackagedModule).importModule;
  if (name !== packageJson.name) {
    actualDependencies[packageJson.name] = "required";
  }

  const actualPromote: ModuleConfig<T>["promote"] =
    promote?.map(({ key, ...it }) => ({
      path: key.split("."),
      ...it,
    })) ?? [];

  return validate({
    dependencies: actualDependencies,
    promote: actualPromote,
    setup: () => {},
    afterSetup: () => {},
    types: {
      emitters: types?.emitters ?? {},
      loaders: types?.loaders ?? {},
      hooks: types?.hooks ?? {},
      services: types?.services ?? {},
      registries: types?.registries ?? [],
      rewrite: types?.rewrite ?? ((it) => it),
    } as ModuleImports<T>,
    ...config,
    name,
  });
}

function validate<T extends ModuleTypes>(
  config: ModuleConfig<T>,
): ModuleConfig<T> {
  if (!config.name) {
    throw new Error("module name missing");
  }

  return config;
}
