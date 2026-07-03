import type { RegistryId } from "@adeficior/data-modifier/generated";
import {
  combineResolvers,
  distributedAcceptor,
  extendContext,
  filterAcceptor,
  type Acceptor,
  type BaseContext,
  type FilterOptions,
  type Logger,
  type Resolver,
} from "@adeficior/pack-resolver";
import { createMergingAcceptor } from "@adeficior/resource-merger";
import createIngredientPredicate, {
  type IngredientFilter,
} from "../common/ingredient/filter.js";
import IngredientSerializer from "../common/ingredient/serializer.js";
import ResultSerializer from "../common/result/serializer.js";
import type { BlockstateRules } from "../emit/assets/blockstates.js";
import BlockstateEmitter from "../emit/assets/blockstates.js";
import type { LangRules } from "../emit/assets/lang.js";
import LangEmitter from "../emit/assets/lang.js";
import type { ModelRulesGroup } from "../emit/assets/models.js";
import ModelEmitter from "../emit/assets/models.js";
import type { BlacklistOptions, BlacklistRules } from "../emit/blacklist.js";
import BlacklistEmitter from "../emit/blacklist.js";
import type { BlockDefinitionRules } from "../emit/content/blockDefinition.js";
import BlockDefinitionEmitter from "../emit/content/blockDefinition.js";
import type { ItemDefinitionRules } from "../emit/content/itemDefinition.js";
import ItemDefinitionEmitter from "../emit/content/itemDefinition.js";
import type { LootRules } from "../emit/data/loot.js";
import LootTableEmitter from "../emit/data/loot.js";
import type { RecipeRules } from "../emit/data/recipe.js";
import RecipeEmitter from "../emit/data/recipe.js";
import type { TagEmitterOptions, TagRules } from "../emit/data/tags.js";
import TagEmitter from "../emit/data/tags.js";
import type { ClearableEmitter } from "../emit/index.js";
import type { PolytoneTabs } from "../emit/polytoneTabs.js";
import PolytoneTabsEmitter from "../emit/polytoneTabs.js";
import {
  lootTableFolder,
  recipeFolder,
  type SemVerInput,
} from "../packFormat.js";
import type { PackContext } from "./context.js";
import type Loader from "./index.js";
import LangLoader from "./lang.js";
import LootTableLoader from "./loot.js";
import type { RecipeLoaderAccessor } from "./recipe.js";
import RecipeLoader from "./recipe.js";
import RegistryDumpLoader from "./registry/dump.js";
import type RegistryLookup from "./registry/index.js";
import WrappedRegistryLookup from "./registry/wrapped.js";
import TagsLoader from "./tags.js";

export interface PackLoaderOptions extends TagEmitterOptions, BlacklistOptions {
  packFormat: SemVerInput;
}

export default class PackLoader implements Loader {
  private readonly lookup = new WrappedRegistryLookup();

  private readonly emitters: ClearableEmitter[] = [];

  readonly tags: TagRules;
  readonly recipes: RecipeRules;
  readonly loot: LootRules;
  readonly lang: LangRules;
  readonly tabs: PolytoneTabs;
  readonly blacklist: BlacklistRules;
  private readonly itemDefinition: ItemDefinitionRules;
  private readonly blockDefinition: BlockDefinitionRules;

  private readonly tagLoader: TagsLoader;
  private readonly recipesLoader: RecipeLoader;
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

  private readonly acceptor: Acceptor;
  private readonly context: PackContext;

  constructor(
    readonly logger: Logger,
    options: PackLoaderOptions,
  ) {
    this.tagLoader = new TagsLoader(options.packFormat);
    this.lootLoader = new LootTableLoader();
    this.langLoader = new LangLoader();

    this.tags = this.registerEmitter(new TagEmitter(this.tagLoader, options));

    this.results = new ResultSerializer(options.packFormat, this.lookup);
    this.ingredients = new IngredientSerializer(
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

    this.recipesLoader = new RecipeLoader(this.context);

    this.recipes = this.registerEmitter(
      new RecipeEmitter(
        logger,
        this.recipesLoader,
        this.context,
        this.recipesLoader,
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

    this.acceptor = filterAcceptor(
      createMergingAcceptor(
        distributedAcceptor({
          "data/*/tags/**/*.json": this.tagLoader,
          [`data/*/${recipeFolder(options.packFormat)}/**/*.json`]:
            this.recipesLoader,
          [`data/*/${lootTableFolder(options.packFormat)}/**/*.json`]:
            this.lootLoader,
          "assets/*/lang/*.json": this.langLoader,
        }),
      ),
      {
        include: ["assets/**/*.json", "data/**/*.json"],
      } satisfies FilterOptions,
    );
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
    return this.recipesLoader;
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
    await resolver.extract(this.acceptor);
  }

  async loadRegistryDump(resolver: Resolver) {
    const registryDumpLoader = new RegistryDumpLoader();
    await resolver.extract(registryDumpLoader);
    this.lookup.set(registryDumpLoader);
  }

  clear() {
    this.recipesLoader.clear();
    this.lookup.reset();

    this.emitters.forEach((it) => it.clear());
  }

  private resolver(context: BaseContext) {
    return combineResolvers(
      this.emitters.map((it) =>
        it.resolver(extendContext(context, { emitter: it.constructor.name })),
      ),
      { async: true },
    );
  }

  async emit(to: Acceptor) {
    await this.resolver({ logger: this.logger }).extract(to);
  }

  async run(from: Resolver, to: Acceptor) {
    await this.loadFrom(from);
    await this.emit(to);
  }
}
