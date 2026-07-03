import { encodeId } from "../common/id.js";
import { IllegalShapeError } from "../error.js";

import {
  FluidConversionRecipeParser,
  HammeringRecipeParser,
  InputOutputRecipeParser,
  NasaWorkbenchRecipeParser,
  SpaceStationRecipeParser,
} from "../parser/adAstra.js";
import {
  ApothecaryRecipeParser,
  BrewRecipeParser,
  ElvenTradeRecipeParser,
  GogWrapperRecipeParser,
  ManaInfusionRecipeParser,
  NbtWrapperRecipeParser,
  OrechidRecipeParser,
  PureDaisyRecipeParser,
  RunicAltarRecipeParser,
  TerraPlateRecipeParser,
} from "../parser/botania.js";
import {
  AssemblyRecipeParser,
  CreateProcessingRecipeParser,
} from "../parser/create.js";
import {
  GrindstonePolishingParser,
  ShapedParser,
  ShapelessParser,
  SmeltingParser,
  SmithingParser,
  StonecuttingParser,
} from "../parser/index.js";
import CookingRecipeParser from "../parser/recipe/farmersdelight/cooking.js";
import CuttingRecipeParser from "../parser/recipe/farmersdelight/cutting.js";
import ForgeConditionalRecipeParser from "../parser/recipe/forge/conditional.js";
import type RecipeParser from "../parser/recipe/index.js";
import {
  RecipeHolder,
  type Recipe,
  type RecipeSerializer,
} from "../parser/recipe/index.js";
import {
  RootComponentRecipeParser,
  RootRitualRecipeParser,
} from "../parser/roots.js";
import {
  ThermalCatalystRecipeParser,
  ThermalFuelRecipeParser,
  ThermalRecipeParser,
  TreeExtractionRecipeParser,
} from "../parser/thermal.js";
import type { RecipeDefinition } from "../schema/data/recipe.js";
import type { PackContext } from "./context.js";
import { JsonLoader } from "./index.js";

export interface RecipeLoaderAccessor {
  unknownRecipeTypes(): RecipeDefinition[];
  registerParser(
    recipeType: string,
    parser: RecipeParser<RecipeDefinition, Recipe>,
  ): void;
  ignoreType(recipeType: string): void;
}

export default class RecipeLoader
  extends JsonLoader<RecipeHolder>
  implements RecipeLoaderAccessor, RecipeSerializer
{
  private readonly recipeParsers = new Map<
    string,
    RecipeParser<RecipeDefinition, Recipe>
  >();

  private readonly ignoredRecipeTypes = new Set<string>();
  private readonly _unknownRecipeTypes = new Map<string, RecipeDefinition>();

  constructor(
    private readonly serializers: Pick<PackContext, "results" | "ingredients">,
  ) {
    super();

    this.registerParser("minecraft:crafting_shaped", new ShapedParser());
    this.registerParser("minecraft:crafting_shapeless", new ShapelessParser());
    this.registerParser("minecraft:smelting", new SmeltingParser());
    this.registerParser("minecraft:smoking", new SmeltingParser());
    this.registerParser("minecraft:blasting", new SmeltingParser());
    this.registerParser("minecraft:campfire_cooking", new SmeltingParser());
    this.registerParser("minecraft:smithing", new SmithingParser());
    this.registerParser("minecraft:stonecutting", new StonecuttingParser());

    this.registerParser("create:mixing", new CreateProcessingRecipeParser());
    this.registerParser("create:pressing", new CreateProcessingRecipeParser());
    this.registerParser("create:emptying", new CreateProcessingRecipeParser());
    this.registerParser("create:crushing", new CreateProcessingRecipeParser());
    this.registerParser("create:milling", new CreateProcessingRecipeParser());
    this.registerParser(
      "create:compacting",
      new CreateProcessingRecipeParser(),
    );
    this.registerParser("create:filling", new CreateProcessingRecipeParser());
    this.registerParser("create:cutting", new CreateProcessingRecipeParser());
    this.registerParser(
      "create:item_application",
      new CreateProcessingRecipeParser(),
    );
    this.registerParser(
      "create:sandpaper_polishing",
      new CreateProcessingRecipeParser(),
    );
    this.registerParser("create:deploying", new CreateProcessingRecipeParser());
    this.registerParser("create:splashing", new CreateProcessingRecipeParser());
    this.registerParser("create:haunting", new CreateProcessingRecipeParser());
    this.registerParser("create:mechanical_crafting", new ShapedParser());
    this.registerParser(
      "create:sequenced_assembly",
      new AssemblyRecipeParser(),
    );

    this.registerParser("farmersdelight:cooking", new CookingRecipeParser());
    this.registerParser("farmersdelight:cutting", new CuttingRecipeParser());
    this.registerParser("farmersrespite:brewing", new CookingRecipeParser());

    this.registerParser("thermal:bottler", new ThermalRecipeParser());
    this.registerParser("thermal:centrifuge", new ThermalRecipeParser());
    this.registerParser("thermal:chiller", new ThermalRecipeParser());
    this.registerParser("thermal:crucible", new ThermalRecipeParser());
    this.registerParser("thermal:crystallizer", new ThermalRecipeParser());
    this.registerParser("thermal:furnace", new ThermalRecipeParser());
    this.registerParser("thermal:insolator", new ThermalRecipeParser());
    this.registerParser(
      "thermal:insolator_catalyst",
      new ThermalCatalystRecipeParser(),
    );
    this.registerParser("thermal:press", new ThermalRecipeParser());
    this.registerParser("thermal:pulverizer", new ThermalRecipeParser());
    this.registerParser(
      "thermal:pulverizer_recycle",
      new ThermalRecipeParser(),
    );
    this.registerParser(
      "thermal:pulverizer_catalyst",
      new ThermalCatalystRecipeParser(),
    );
    this.registerParser("thermal:pyrolyzer", new ThermalRecipeParser());
    this.registerParser("thermal:refinery", new ThermalRecipeParser());
    this.registerParser("thermal:sawmill", new ThermalRecipeParser());
    this.registerParser("thermal:smelter", new ThermalRecipeParser());
    this.registerParser("thermal:smelter_recycle", new ThermalRecipeParser());
    this.registerParser(
      "thermal:smelter_catalyst",
      new ThermalCatalystRecipeParser(),
    );
    this.registerParser(
      "thermal:tree_extractor",
      new TreeExtractionRecipeParser(),
    );
    this.registerParser(
      "thermal:compression_fuel",
      new ThermalFuelRecipeParser(),
    );
    this.registerParser("thermal:magmatic_fuel", new ThermalFuelRecipeParser());
    this.registerParser("thermal:gourmand_fuel", new ThermalFuelRecipeParser());
    this.registerParser(
      "thermal:numismatic_fuel",
      new ThermalFuelRecipeParser(),
    );

    this.registerParser(
      "botania:nbt_output_wrapper",
      new NbtWrapperRecipeParser(),
    );
    this.registerParser("botania:orechid", new OrechidRecipeParser());
    this.registerParser("botania:orechid_ignem", new OrechidRecipeParser());
    this.registerParser("botania:marimorphosis", new OrechidRecipeParser());
    this.registerParser("botania:pure_daisy", new PureDaisyRecipeParser());
    this.registerParser(
      "botania:state_copying_pure_daisy",
      new PureDaisyRecipeParser(),
    );
    this.registerParser("botania:mana_upgrade", new ShapedParser());
    this.registerParser(
      "botania:water_bottle_matching_shaped",
      new ShapedParser(),
    );
    this.registerParser("botania:runic_altar", new RunicAltarRecipeParser());
    this.registerParser(
      "botania:runic_altar_head",
      new RunicAltarRecipeParser(),
    );
    this.registerParser("botania:terra_plate", new TerraPlateRecipeParser());
    this.registerParser("botania:elven_trade", new ElvenTradeRecipeParser());
    this.registerParser("botania:brew", new BrewRecipeParser());
    this.registerParser("botania:twig_wand", new ShapedParser());
    this.registerParser(
      "botania:mana_infusion",
      new ManaInfusionRecipeParser(),
    );
    this.registerParser(
      "botania:mana_upgrade_shapeless",
      new ShapelessParser(),
    );
    this.registerParser("botania:armor_upgrade", new ShapedParser());
    this.registerParser(
      "botania:gog_alternation",
      new GogWrapperRecipeParser(),
    );
    this.registerParser(
      "botania:petal_apothecary",
      new ApothecaryRecipeParser(),
    );

    this.registerParser("theoneprobe:probe_helmet", new ShapedParser());

    this.registerParser(
      "forge:conditional",
      new ForgeConditionalRecipeParser(),
    );

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

    this.ignoreType("jeed:effect_provider");
    this.ignoreType("jeed:potion_provider");

    this.ignoreType("pipez:copy_nbt");
    this.ignoreType("pipez:clear_nbt");

    this.ignoreType("refinedstorage:upgrade_with_enchanted_book");

    this.ignoreType("forge:ore_shaped");

    this.ignoreType("supplementaries:trapped_present");
    this.ignoreType("supplementaries:weathered_map");
    this.ignoreType("supplementaries:soap_clearing");
    this.ignoreType("supplementaries:rope_arrow_create");
    this.ignoreType("supplementaries:present_dye");
    this.ignoreType("supplementaries:rope_arrow_add");
    this.ignoreType("supplementaries:item_lore");
    this.ignoreType("supplementaries:flag_from_banner");
    this.ignoreType("supplementaries:bubble_blower_charge");
    this.ignoreType("supplementaries:bamboo_spikes_tipped");
    this.ignoreType("supplementaries:antique_book");
    this.ignoreType("supplementaries:cauldron_flag_dye");
    this.ignoreType("supplementaries:cauldron_flag_clear");
    this.ignoreType("supplementaries:cauldron_blackboard");

    this.ignoreType("quark:mixed_exclusion");
    this.ignoreType("quark:elytra_duplication");
    this.ignoreType("quark:slab_to_block");

    // TODO could to in the future
    this.ignoreType("ad_astra:lunarian_trade_simple");
    this.ignoreType("ad_astra:lunarian_trade_enchanted_item");
    this.ignoreType("ad_astra:lunarian_trade_suspicious_stew");
    this.ignoreType("ad_astra:lunarian_trade_enchanted_book");
    this.ignoreType("ad_astra:lunarian_trade_dyed_item");
    this.ignoreType("ad_astra:lunarian_trade_potioned_item");

    this.ignoreType("immersiveengineering:cloche");
    this.ignoreType("immersiveengineering:crusher");
    this.ignoreType("immersiveengineering:fermenter");
    this.ignoreType("immersiveengineering:metal_press");
    this.ignoreType("immersiveengineering:squeezer");
    this.ignoreType("immersiveengineering:mineral_mix");
  }

  ignoreType(recipeType: string) {
    this.ignoredRecipeTypes.add(recipeType);
  }

  unknownRecipeTypes() {
    return [...this._unknownRecipeTypes.values()];
  }

  private recipeParseContext() {
    return { ...this.serializers, recipes: this };
  }

  serialize(recipe: RecipeHolder): RecipeDefinition {
    // TODO group logger?
    const context = this.recipeParseContext();
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

    const parsed = parser.deserialize(definition, this.recipeParseContext());

    return new RecipeHolder(definition, parsed);
  }

  override parse(definition: RecipeDefinition): RecipeHolder | null {
    if (this.ignoredRecipeTypes.has(definition.type)) return null;
    // TODO only print unknown recipe types once in the end
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
