import  { type Container ,
  type LoaderContext,
  type ModuleConfig,
  type PackLoaderOptions,
} from "@adeficior/data-modifier-core";
import {
  combineResolvers,
  createLogger,
  distributedAcceptor,
  filterAcceptor,
  type Acceptor,
  type Logger,
  type Resolver,
} from "@adeficior/pack-resolver";
import { createMergingAcceptor } from "@adeficior/resource-merger";
import { overwritePackMetadata } from "./emit/packMetadata";
import { InstallTarget } from "./installTarget";

export interface DataModifier extends Container {
  loadFromMultiple(resolvers: Resolver[]): Promise<void>;
  loadFrom(resolvers: Resolver): Promise<void>;
  reset(): void;
}

export type LoaderEmitOptions = {
  description?: string;
};

class DataModifierImpl extends InstallTarget implements DataModifier {
  constructor(
    // TODO rename "pack" things
    // TODO not needed here really
    private readonly options: PackLoaderOptions,
    private readonly logger: Logger,
  ) {
    super();
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
    await this.resolver({ ...options, logger: this.logger }).extract(to);
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

export async function createDataModifier({
  modules = [],
  logger = createLogger(),
  ...options
}: PackLoaderOptions & {
  modules?: ModuleConfig[];
  logger?: Logger;
}): Promise<DataModifier> {
  const instance = new DataModifierImpl(options, logger);
  await instance.install(options, ...modules);
  return instance;
}
