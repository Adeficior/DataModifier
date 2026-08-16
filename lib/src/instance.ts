import type {
  Container,
  DataModifierOptions,
  LoaderContext,
  ModuleConfig,
  ModuleSetupOptions,
  ModuleType,
  ModuleTypes,
} from "@adeficior/data-modifier-core";
import type { Acceptor, Logger, Resolver } from "@adeficior/pack-resolver";
import {
  combineResolvers,
  distributedAcceptor,
  filterAcceptor,
} from "@adeficior/pack-resolver";
import { createMergingAcceptor } from "@adeficior/resource-merger";
import { installBuiltinModules } from "./builtinModules";
import { overwritePackMetadata } from "./emit/packMetadata";
import { InstallTarget } from "./installTarget";
import { promote } from "./promotions";
import type { Promoted } from "./promotions";

export interface DataModifier extends Container {
  loadFromMultiple(resolvers: Resolver[]): Promise<void>;
  loadFrom(resolvers: Resolver): Promise<void>;
  emit(to: Acceptor, options?: LoaderEmitOptions): Promise<void>;
  reset(): void;
}

export type LoaderEmitOptions = {
  description?: string;
};

class DataModifierImpl extends InstallTarget implements DataModifier {
  constructor(options: ModuleSetupOptions) {
    super(options);
  }

  loadFromMultiple(resolvers: Resolver[]) {
    const combined = combineResolvers(resolvers);
    return this.loadFrom(combined);
  }

  async loadFrom(resolver: Resolver) {
    const acceptor: Acceptor = filterAcceptor(
      createMergingAcceptor(distributedAcceptor(this.loaders)),
      {
        include: ["assets/**/*.json", "data/**/*.json"],
      },
    );

    await resolver.extract(acceptor);
  }

  private resolver({
    description,
    ...context
  }: LoaderContext & LoaderEmitOptions) {
    const emittersResolver = this.emitters.resolver(context);

    return overwritePackMetadata(emittersResolver, {
      ...context,
      description,
      packFormat: this.options.packFormat,
    });
  }

  async emit(to: Acceptor, options: LoaderEmitOptions = {}) {
    const logger = this.get<Logger>("logger");
    await this.resolver({ ...options, logger }).extract(to);
  }

  async run(from: Resolver, to: Acceptor) {
    await this.loadFrom(from);
    await this.emit(to);
  }

  reset() {
    this.emitters.clear();
  }
}

export type DataModifierBuilder = {
  install<T extends ModuleTypes>(
    module: ModuleConfig<T>,
    options?: ModuleType<T, "options">,
  ): void;
};

export type DataModifierFactory = (builder: DataModifierBuilder) => void;

type GatheredModule<T extends ModuleTypes = ModuleTypes> = {
  module: ModuleConfig<T>;
  options?: ModuleType<T, "options">;
};

export async function createDataModifier(
  { packFormat, ...coreOptions }: DataModifierOptions,
  factory: DataModifierFactory = () => {},
): Promise<Promoted<DataModifier, "modifier">> {
  const moduleSetupOptions: ModuleSetupOptions = { packFormat };
  const instance = new DataModifierImpl(moduleSetupOptions);

  const gatheredModules: GatheredModule[] = [];

  const builder: DataModifierBuilder = {
    install: (module, options) => {
      gatheredModules.push({ module, options } as GatheredModule);
    },
  };

  factory(builder);
  installBuiltinModules(coreOptions)(builder);

  const modules = gatheredModules.map((it) => it.module);

  // TODO only pass options to module that belong to it
  const moduleOptions = gatheredModules.reduce(
    (a, b) => ({ ...a, ...b.options }),
    {},
  );

  await instance.install(modules, moduleOptions);

  return promote(
    instance,
    modules
      .flatMap((it) => it.promote)
      .filter((it) => it.target === "modifier"),
    instance,
  );
}
