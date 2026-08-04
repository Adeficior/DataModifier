import type { RegistryId } from "@adeficior/data-modifier/generated";
import {
  combineResolvers,
  distributedAcceptor,
  extendContext,
  filterAcceptor,
  type Acceptor,
  type BaseContext,
  type Logger,
  type Resolver,
} from "@adeficior/pack-resolver";
import { createMergingAcceptor } from "@adeficior/resource-merger";
import type Loader from ".";
import createIngredientPredicate, {
  type IngredientFilter,
} from "../common/ingredient/filter";
import type { ClearableEmitter } from "../emit";
import type { BlockstateRules } from "../emit/assets/blockstates";
import BlockstateEmitter from "../emit/assets/blockstates";
import type { LangRules } from "../emit/assets/lang";
import LangEmitter from "../emit/assets/lang";
import type { ModelRulesGroup } from "../emit/assets/models";
import ModelEmitter from "../emit/assets/models";
import type { BlacklistOptions, BlacklistRules } from "../emit/blacklist";
import BlacklistEmitter from "../emit/blacklist";
import type { BlockDefinitionRules } from "../emit/content/blockDefinition";
import BlockDefinitionEmitter from "../emit/content/blockDefinition";
import type { ItemDefinitionRules } from "../emit/content/itemDefinition";
import ItemDefinitionEmitter from "../emit/content/itemDefinition";
import type { LootRules } from "../emit/data/loot";
import LootTableEmitter from "../emit/data/loot";
import type { RecipeRules } from "../emit/data/recipe";
import RecipeEmitter from "../emit/data/recipe";
import type { TagEmitterOptions, TagRules } from "../emit/data/tags";
import TagEmitter from "../emit/data/tags";
import { overwritePackMetadata } from "../emit/packMetadata";
import type { PolytoneTabs } from "../emit/polytoneTabs";
import PolytoneTabsEmitter from "../emit/polytoneTabs";
import {
  RecipeGraphEmitter,
  type RecipeGraphAccessor,
} from "../emit/recipeGraph";
import { lootTableFolder, recipeFolder, type SemVerInput } from "../packFormat";
import {
  createIngredientSerializer,
  type IngredientSerializer,
} from "../serializer/ingredients";
import {
  createResultSerializer,
  type ResultSerializer,
} from "../serializer/results";
import type { PackContext } from "./context";
import LangLoader from "./lang";
import LootTableLoader from "./loot";
import type { RecipeLoaderAccessor } from "./recipe";
import RecipeLoader from "./recipe";
import type RegistryLookup from "./registry";
import RegistryDumpLoader from "./registry/dump";
import WrappedRegistryLookup from "./registry/wrapped";
import TagsLoader from "./tags";

export interface PackLoaderOptions extends TagEmitterOptions, BlacklistOptions {
  packFormat: SemVerInput;
}

// TODO icon?
export type LoaderEmitOptions = {
  description?: string;
};

export default class PackLoader implements Loader {
  private readonly lookup = new WrappedRegistryLookup();

  private readonly emitters: ClearableEmitter[] = [];
  private readonly loaders: Record<string, Acceptor> = {};

  readonly tags: TagRules;
  readonly recipes: RecipeRules;
  readonly loot: LootRules;
  readonly lang: LangRules;
  readonly tabs: PolytoneTabs;
  readonly blacklist: BlacklistRules;
  private readonly itemDefinition: ItemDefinitionRules;
  private readonly blockDefinition: BlockDefinitionRules;

  private readonly tagLoader: TagsLoader;
  private readonly _recipeLoader: RecipeLoader;
  private readonly lootLoader: LootTableLoader;
  private readonly langLoader: LangLoader;
  readonly blockstates: BlockstateRules = this.registerEmitter(
    new BlockstateEmitter(),
  );

  readonly models: ModelRulesGroup = {
    blocks: this.registerEmitter(new ModelEmitter("block")),
    items: this.registerEmitter(new ModelEmitter("item")),
  };

  private readonly results: ResultSerializer;
  private readonly ingredients: IngredientSerializer;

  private readonly context: PackContext;

  private readonly packFormat: SemVerInput;

  readonly recipeGraph: RecipeGraphAccessor;

  constructor(
    private readonly logger: Logger,
    options: PackLoaderOptions,
  ) {
    this.packFormat = options.packFormat;
    this.tagLoader = this.registerLoader(
      "data/*/tags/**/*.json",
      new TagsLoader(options.packFormat),
    );
    this.lootLoader = this.registerLoader(
      `data/*/${lootTableFolder(this.packFormat)}/**/*.json`,
      new LootTableLoader(),
    );
    this.langLoader = this.registerLoader(
      "assets/*/lang/*.json",
      new LangLoader(),
    );

    this.tags = this.registerEmitter(new TagEmitter(this.tagLoader, options));

    this.results = createResultSerializer(options.packFormat, this.lookup);
    this.ingredients = createIngredientSerializer(
      options.packFormat,
      this.lookup,
    );

    this.context = {
      tags: this.tagLoader,
      ingredients: this.ingredients,
      results: this.results,
      lookup: this.lookup,
      packFormat: options.packFormat,
    };

    this._recipeLoader = this.registerLoader(
      `data/*/${recipeFolder(this.packFormat)}/**/*.json`,
      new RecipeLoader(this.context),
    );

    this.recipes = this.registerEmitter(
      new RecipeEmitter(
        logger,
        this._recipeLoader,
        this.context,
        this._recipeLoader,
      ),
    );

    this.loot = this.registerEmitter(
      new LootTableEmitter(this.lootLoader, this.context),
    );

    this.lang = this.registerEmitter(new LangEmitter(this.langLoader));

    this.tabs = this.registerEmitter(new PolytoneTabsEmitter(this.lookup));

    this.blacklist = this.registerEmitter(
      new BlacklistEmitter(this.context, options),
    );

    this.itemDefinition = this.registerEmitter(
      new ItemDefinitionEmitter(this.models, this.blockstates, this.loot),
    );

    this.blockDefinition = this.registerEmitter(
      new BlockDefinitionEmitter(
        this.models.blocks,
        this.blockstates,
        this.loot,
      ),
    );

    this.recipeGraph = this.registerEmitter(
      new RecipeGraphEmitter(this._recipeLoader, this.tagLoader),
    );
  }

  registerLoader<T extends Acceptor>(filePattern: string, loader: T): T {
    this.loaders[filePattern] = loader;
    return loader;
  }

  registerEmitter<T extends ClearableEmitter>(emitter: T): T {
    this.emitters.push(emitter);
    return emitter;
  }

  registerRegistry(key: string) {
    this.tagLoader.registerRegistry(key);
  }

  tagRegistry<T extends RegistryId>(key: T) {
    return this.tagLoader.registry(key);
  }

  get content(): Readonly<{
    blocks: BlockDefinitionRules;
    items: ItemDefinitionRules;
  }> {
    return {
      blocks: this.blockDefinition,
      items: this.itemDefinition,
    };
  }

  get recipeLoader(): RecipeLoaderAccessor {
    return this._recipeLoader;
  }

  get registries(): RegistryLookup {
    return this.lookup;
  }

  resolveIngredientTest(test: IngredientFilter) {
    return createIngredientPredicate(test, this.context);
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

  async loadRegistryDump(resolver: Resolver) {
    const registryDumpLoader = new RegistryDumpLoader();
    await resolver.extract(registryDumpLoader);
    this.lookup.set(registryDumpLoader);
  }

  clear() {
    this._recipeLoader.clear();
    this.lookup.reset();

    this.emitters.forEach((it) => it.clear());
  }

  private resolver(context: BaseContext & LoaderEmitOptions) {
    const emittersResolver = combineResolvers(
      this.emitters.map((it) =>
        it.resolver(extendContext(context, { emitter: it.constructor.name })),
      ),
      { async: true },
    );

    return overwritePackMetadata(emittersResolver, {
      ...context,
      packFormat: this.packFormat,
    });
  }

  async emit(to: Acceptor, options: LoaderEmitOptions = {}) {
    await this.resolver({ ...options, logger: this.logger }).extract(to);
  }

  async run(from: Resolver, to: Acceptor) {
    await this.loadFrom(from);
    await this.emit(to);
  }
}
