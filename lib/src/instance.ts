import {
  type ClearableEmitter,
  type Loader,
  type LoaderContext,
  type ModuleConfig,
  type PackLoaderOptions,
} from "@adeficior/data-modifier-core";
import {
  combineResolvers,
  createLogger,
  distributedAcceptor,
  extendContext,
  filterAcceptor,
  type Acceptor,
  type Logger,
  type Resolver,
} from "@adeficior/pack-resolver";
import { createMergingAcceptor } from "@adeficior/resource-merger";
import { overwritePackMetadata } from "./emit/packMetadata";

export interface DataModifier {
  loadFromMultiple(resolvers: Resolver[]): Promise<void>;
  loadFrom(resolvers: Resolver): Promise<void>;
}

export type LoaderEmitOptions = {
  description?: string;
};

class DataModifierImpl implements DataModifier {
  private readonly emitters: ClearableEmitter[] = [];
  private readonly loaders: Record<string, Loader> = {};

  constructor(
    // TODO rename "pack" things
    private readonly options: PackLoaderOptions,
    private readonly logger: Logger,
  ) {}

  async install(...modules: ModuleConfig[]) {
    // TODO sort by dependencies or some shit
    modules.forEach(() => {});
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
    const emittersResolver = combineResolvers(
      this.emitters.map((it) =>
        it.resolver(extendContext(context, { emitter: it.constructor.name })),
      ),
      { async: true },
    );

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
  await instance.install(...modules);
  return instance;
}
