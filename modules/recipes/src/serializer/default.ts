import type { RegisterRecipeSerializer } from "../hooks";
import { ForgeConditionalRecipeSerializer } from "./forge/conditional";
import { ShapedSerializer } from "./vanilla/shaped";
import { ShapelessSerializer } from "./vanilla/shapeless";
import { SmeltingSerializer } from "./vanilla/smelting";
import { SmithingSerializer } from "./vanilla/smithing";
import { StonecuttingSerializer } from "./vanilla/stonecutting";

export function registerDefaultSerializers(event: RegisterRecipeSerializer) {
  event.register("minecraft:crafting_shaped", new ShapedSerializer());
  event.register("minecraft:crafting_shapeless", new ShapelessSerializer());
  event.register("minecraft:smelting", new SmeltingSerializer());
  event.register("minecraft:smoking", new SmeltingSerializer());
  event.register("minecraft:blasting", new SmeltingSerializer());
  event.register("minecraft:campfire_cooking", new SmeltingSerializer());
  event.register("minecraft:smithing", new SmithingSerializer());
  event.register("minecraft:smithing_trim", new SmithingSerializer());
  event.register("minecraft:smithing_transform", new SmithingSerializer());
  event.register("minecraft:stonecutting", new StonecuttingSerializer());

  event.register("theoneprobe:probe_helmet", new ShapedSerializer());

  event.register("forge:conditional", new ForgeConditionalRecipeSerializer());

  event.register("patchouli:shapeless_book_recipe", new ShapelessSerializer());

  /*
    TODO move to seperate modules

    event.register(
      "sullysmod:grindstone_polishing",
      new GrindstonePolishingParser(),
    );

    event.register("ad_astra:hammering", new HammeringRecipeSerializer());
    event.register(
      "ad_astra:cryo_fuel_conversion",
      new FluidConversionRecipeSerializer(),
    );
    event.register(
      "ad_astra:fuel_conversion",
      new FluidConversionRecipeSerializer(),
    );
    event.register(
      "ad_astra:oxygen_conversion",
      new FluidConversionRecipeSerializer(),
    );
    event.register("ad_astra:compressing", new InputOutputRecipeSerializer());
    event.register(
      "ad_astra:crafting_shaped_space_suit",
      new ShapedParser(),
    );
    event.register(
      "ad_astra:nasa_workbench",
      new NasaWorkbenchRecipeSerializer(),
    );
    event.register(
      "ad_astra:space_station",
      new SpaceStationRecipeSerializer(),
    );

    event.register(
      "rootsclassic:component",
      new RootComponentRecipeSerializer(),
    );
    event.register("rootsclassic:ritual", new RootRitualRecipeSerializer());
    */
}
