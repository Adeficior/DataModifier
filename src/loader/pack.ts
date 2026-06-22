import type { RegistryId } from "@adeficior/data-modifier/generated";
import type {
  Acceptor,
  IResolver,
  Logger,
  ResolverInfo,
} from "@adeficior/pack-resolver";
import match from "minimatch";
import type { IngredientInput, IngredientTest } from "../common/ingredient.js";
import { createIngredient } from "../common/ingredient.js";
import type { ResultInput } from "../common/result.js";
import { createResult } from "../common/result.js";
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
import type { SemVerInput } from "../packFormat.js";
import type Loader from "./index.js";
import type { AcceptorWithLoader } from "./index.js";
import LangLoader from "./lang.js";
import LootTableLoader from "./loot.js";
import type { RecipeLoaderAccessor } from "./recipe.js";
import RecipeLoader from "./recipe.js";
import RegistryDumpLoader from "./registry/dump.js";
import EmptyRegistryLookup from "./registry/empty.js";
import type RegistryLookup from "./registry/index.js";
import TagsLoader from "./tags.js";

export interface PackLoaderOptions extends TagEmitterOptions, BlacklistOptions {
  packFormat: SemVerInput;
}

export default class PackLoader implements Loader, ClearableEmitter {
  private activeRegistryLookup: RegistryLookup = new EmptyRegistryLookup();

  private readonly emitters: ClearableEmitter[] = [];

  readonly tags: TagRules;
  readonly recipes: RecipeRules;
  readonly loot: LootRules;
  readonly lang: LangRules;
  readonly tabs: PolytoneTabs;
  readonly blacklist: BlacklistRules;
  private readonly itemDefinition: ItemDefinitionRules;
  private readonly blockDefinition: BlockDefinitionRules;

  private readonly tagLoader = new TagsLoader(() => this.activeRegistryLookup);
  private readonly recipesLoader = new RecipeLoader();
  private readonly lootLoader = new LootTableLoader();
  private readonly langLoader = new LangLoader();
  readonly blockstates: BlockstateRules = this.registerEmitter(
    new BlockstateEmitter(),
  );

  readonly models: ModelRulesGroup = {
    blocks: this.registerEmitter(new ModelEmitter("block")),
    items: this.registerEmitter(new ModelEmitter("item")),
  };

  constructor(
    readonly logger: Logger,
    options: PackLoaderOptions,
  ) {
    this.tags = this.registerEmitter(
      new TagEmitter(logger, this.tagLoader, options),
    );

    this.recipes = this.registerEmitter(
      new RecipeEmitter(
        logger,
        this.recipesLoader,
        this.tagLoader,
        () => this.activeRegistryLookup,
        options.packFormat,
      ),
    );

    this.loot = this.registerEmitter(
      new LootTableEmitter(
        logger,
        this.lootLoader,
        this.tagLoader,
        () => this.activeRegistryLookup,
        options.packFormat,
      ),
    );

    this.lang = this.registerEmitter(new LangEmitter(this.langLoader));

    this.tabs = this.registerEmitter(
      new PolytoneTabsEmitter(() => this.activeRegistryLookup),
    );

    this.blacklist = this.registerEmitter(
      new BlacklistEmitter(
        logger,
        this.tagLoader,
        () => this.activeRegistryLookup,
        options,
      ),
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
    return this.activeRegistryLookup;
  }

  createResult(input: ResultInput) {
    return createResult(input, this.activeRegistryLookup);
  }

  createIngredient(input: IngredientInput) {
    return createIngredient(input, this.activeRegistryLookup);
  }

  resolveIngredientTest(test: IngredientTest) {
    return this.recipes.resolveIngredientTest(test);
  }

  private acceptors: Record<string, AcceptorWithLoader> = {
    "data/*/tags/**/*.json": this.tagLoader.accept,
    "data/*/recipes/**/*.json": this.recipesLoader.accept,
    "data/*/recipe/**/*.json": this.recipesLoader.accept,
    "data/*/loot_tables/**/*.json": this.lootLoader.accept,
    "data/*/loot_table/**/*.json": this.lootLoader.accept,
    "assets/*/lang/*.json": this.langLoader.accept,
  };

  private loadInternal(resolver: IResolver, logger: Logger) {
    return resolver.extract((path, content) => {
      const acceptor = Object.entries(this.acceptors).find(([pattern]) =>
        match(path, pattern),
      )?.[1];
      if (!acceptor) return false;
      return acceptor(logger, path, content);
    });
  }

  async loadFromMultiple(resolvers: ResolverInfo[]) {
    await Promise.all(
      resolvers.map(({ resolver, name }) => {
        const logger = this.logger.group(name);
        return this.loadInternal(resolver, logger);
      }),
    );

    this.freeze();
  }

  async loadFrom(resolver: IResolver) {
    await this.loadInternal(resolver, this.logger);
    this.freeze();
  }

  async loadRegistryDump(resolver: IResolver) {
    const registryDumpLoader = new RegistryDumpLoader(this.logger);
    await registryDumpLoader.extract(resolver);
    this.activeRegistryLookup = registryDumpLoader;
  }

  private freeze() {
    this.tagLoader.freeze();
  }

  clear() {
    this.recipesLoader.clear();
    this.activeRegistryLookup = new EmptyRegistryLookup();

    this.emitters.forEach((it) => it.clear());
  }

  async emit(acceptor: Acceptor) {
    await Promise.all(this.emitters.map((it) => it.emit(acceptor)));
  }

  async run(from: IResolver, to: Acceptor) {
    await this.loadFrom(from);
    await this.emit(to);
  }
}
