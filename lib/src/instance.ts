import {
  type Container,
  type LoaderContext,
  type ModuleConfig,
  type ModuleType,
  type ModuleTypes,
  type PackLoaderOptions,
} from "@adeficior/data-modifier-core";
import {
  combineResolvers,
  distributedAcceptor,
  filterAcceptor,
  type Acceptor,
  type Resolver,
} from "@adeficior/pack-resolver";
import { createMergingAcceptor } from "@adeficior/resource-merger";
import { builtInModules } from "./builtinModules";
import { overwritePackMetadata } from "./emit/packMetadata";
import { InstallTarget } from "./installTarget";

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
  constructor(
    // TODO rename "pack" things
    options: PackLoaderOptions,
  ) {
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
    await this.resolver({ ...options, logger: this.options.logger }).extract(
      to,
    );
  }

  async run(from: Resolver, to: Acceptor) {
    await this.loadFrom(from);
    await this.emit(to);
  }

  reset() {
    this.emitters.clear();
  }

  // TODO move to module with options
  // async loadRegistryDump(resolver: Resolver) {
  //   const registryDumpLoader = new RegistryDumpLoader();
  //   await resolver.extract(registryDumpLoader);
  //   this.lookup.set(registryDumpLoader);
  // }
}

type DataModifierBuilder = {
  install<T extends ModuleTypes>(
    module: ModuleConfig<T>,
    options?: ModuleType<T, "options">,
  ): void;
};

type GatheredModule<T extends ModuleTypes = ModuleTypes> = {
  module: ModuleConfig<T>;
  options?: ModuleType<T, "options">;
};

export async function createDataModifier<T extends ModuleTypes>(
  options: PackLoaderOptions,
  factory: (builder: DataModifierBuilder) => void,
): Promise<DataModifier> {
  const instance = new DataModifierImpl(options);

  const gatheredModules: GatheredModule[] = [];

  factory({
    install: (module, options) => {
      gatheredModules.push({ module, options } as GatheredModule);
    },
  });

  const modules = [
    ...gatheredModules.map((it) => it.module),
    ...builtInModules(),
  ];

  // TODO only pass options to module that belong to it
  const moduleOptions = gatheredModules.reduce(
    (a, b) => ({ ...a, ...b.options }),
    {},
  );

  await instance.install(modules, moduleOptions);
  return instance;
}
