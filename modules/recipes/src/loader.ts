import { encodeId, JsonLoader } from "@adeficior/data-modifier-core";
import type {
  ConditionContext,
  RegistryProvider,
} from "@adeficior/data-modifier-core";
import { IllegalShapeError } from "@adeficior/data-modifier-core/serializer";
import type {
  IngredientSerializer,
  ResultSerializer,
  WithSerializerModules,
} from "@adeficior/data-modifier-ingredients";
import { omit } from "lodash-es";
import { minimatch } from "minimatch";
import type { RecipeDefinition } from "./schema";
import type { Recipe, RecipeParser } from "./serializer/abstract";
import type {
  RecipeParseContext,
  RecipeSerializer,
} from "./serializer/context";
import { ForgeConditionalRecipeParser } from "./serializer/forge/conditional";
import { RecipeHolder } from "./serializer/holder";
import { ShapedParser } from "./serializer/vanilla/shaped";
import { ShapelessParser } from "./serializer/vanilla/shapeless";
import { SmeltingParser } from "./serializer/vanilla/smelting";
import { SmithingParser } from "./serializer/vanilla/smithing";
import { StonecuttingParser } from "./serializer/vanilla/stonecutting";

export interface RecipeLoaderAccessor extends RegistryProvider<RecipeHolder> {
  unknownRecipeTypes(): RecipeDefinition[];
  registerParser(
    recipeType: string,
    parser: RecipeParser<RecipeDefinition, Recipe>,
  ): void;
  ignoreType(recipeType: string): void;
}

// Split serializer into seperate class
export class RecipeLoader
  extends JsonLoader<RecipeHolder>
  implements RecipeLoaderAccessor, RecipeSerializer
{
  private readonly recipeParsers = new Map<string, RecipeParser>();

  private readonly ignoredRecipeTypePatterns: string[] = [];
  private readonly _unknownRecipeTypes = new Map<string, RecipeDefinition>();

  constructor(
    private readonly resultSerializer: ResultSerializer,
    private readonly ingredientSerializer: IngredientSerializer,
    context?: ConditionContext,
  ) {
    super(context);

    this.registerParser("minecraft:crafting_shaped", new ShapedParser());
    this.registerParser("minecraft:crafting_shapeless", new ShapelessParser());
    this.registerParser("minecraft:smelting", new SmeltingParser());
    this.registerParser("minecraft:smoking", new SmeltingParser());
    this.registerParser("minecraft:blasting", new SmeltingParser());
    this.registerParser("minecraft:campfire_cooking", new SmeltingParser());
    this.registerParser("minecraft:smithing", new SmithingParser());
    this.registerParser("minecraft:smithing_trim", new SmithingParser());
    this.registerParser("minecraft:smithing_transform", new SmithingParser());
    this.registerParser("minecraft:stonecutting", new StonecuttingParser());

    this.registerParser("theoneprobe:probe_helmet", new ShapedParser());

    this.registerParser(
      "forge:conditional",
      new ForgeConditionalRecipeParser(),
    );
    /*
    TODO move to seperate modules

    this.registerParser(
      "sullysmod:grindstone_polishing",
      new GrindstonePolishingParser(),
    );

    this.registerParser("ad_astra:hammering", new HammeringRecipeParser());
    this.registerParser(
      "ad_astra:cryo_fuel_conversion",
      new FluidConversionRecipeParser(),
    );
    this.registerParser(
      "ad_astra:fuel_conversion",
      new FluidConversionRecipeParser(),
    );
    this.registerParser(
      "ad_astra:oxygen_conversion",
      new FluidConversionRecipeParser(),
    );
    this.registerParser("ad_astra:compressing", new InputOutputRecipeParser());
    this.registerParser(
      "ad_astra:crafting_shaped_space_suit",
      new ShapedParser(),
    );
    this.registerParser(
      "ad_astra:nasa_workbench",
      new NasaWorkbenchRecipeParser(),
    );
    this.registerParser(
      "ad_astra:space_station",
      new SpaceStationRecipeParser(),
    );

    this.registerParser(
      "patchouli:shapeless_book_recipe",
      new ShapelessParser(),
    );

    this.registerParser("cofh_core:crafting_shaped_potion", new ShapedParser());

    this.registerParser(
      "rootsclassic:component",
      new RootComponentRecipeParser(),
    );
    this.registerParser("rootsclassic:ritual", new RootRitualRecipeParser());

    this.ignoreType("jeed:*");
    this.ignoreType("immersiveengineering:*");
    */
  }

  ignoreType(pattern: string) {
    this.ignoredRecipeTypePatterns.push(pattern);
  }

  unknownRecipeTypes() {
    return [...this._unknownRecipeTypes.values()];
  }

  private recipeParseContext(
    parser: WithSerializerModules,
  ): RecipeParseContext {
    return {
      recipes: this,
      ingredients: this.ingredientSerializer.selectModule(
        parser.ingredientModules(),
      ),
      results: this.resultSerializer.selectModule(parser.resultModules()),
    };
  }

  serialize(recipe: RecipeHolder): RecipeDefinition {
    const parser = this.recipeParsers.get(recipe.serializerType);

    if (!parser)
      throw new Error(
        `Unable to find parser for type '${recipe.serializerType}'`,
      );

    const context = this.recipeParseContext(parser);
    return recipe.serialize(context);
  }

  deserialize(definition: RecipeDefinition): RecipeHolder {
    if (!definition.type)
      throw new IllegalShapeError(`no recipe type set`, definition);

    const parser = this.recipeParsers.get(encodeId(definition.type));

    if (!("type" in definition))
      throw new IllegalShapeError("recipe type missing");

    if (!parser) {
      if (!this._unknownRecipeTypes.has(definition.type)) {
        this._unknownRecipeTypes.set(definition.type, definition);
      }

      throw new IllegalShapeError(
        `unknown recipe type: '${definition.type}'`,
        definition,
      );
    }

    const parsed = parser.deserialize(
      definition,
      this.recipeParseContext(parser),
    );

    return new RecipeHolder(definition, parsed);
  }

  override parse(definition: RecipeDefinition): RecipeHolder | null {
    if (
      this.ignoredRecipeTypePatterns.some((it) =>
        minimatch(definition.type, it),
      )
    )
      return null;

    // TODO only print unknown recipe types once in the end

    const importantData = omit(
      definition,
      "type",
      "category",
      "conditions",
      "fabric:load_conditions",
      "neoforge:conditions",
    );

    if (Object.keys(importantData).length === 0) return null;

    return this.deserialize(definition);
  }

  registerParser(
    recipeType: string,
    parser: RecipeParser<RecipeDefinition, Recipe>,
  ) {
    this.recipeParsers.set(recipeType, parser);
  }

  clear() {
    this._unknownRecipeTypes.clear();
  }
}
