import type { RegisterRecipeSerializer } from "@adeficior/data-modifier-recipes";
import { ShapedSerializer } from "@adeficior/data-modifier-recipes";
import { ThermalRecipeSerializer } from "./serializer";
import { ThermalCatalystRecipeSerializer } from "./serializer/catalyst";
import { ThermalFuelRecipeSerializer } from "./serializer/fuel";
import { TreeExtractionRecipeSerializer } from "./serializer/treeExtraction";

export function registerSerializers(event: RegisterRecipeSerializer) {
  event.register("cofh_core:crafting_shaped_potion", new ShapedSerializer());

  event.register("thermal:bottler", new ThermalRecipeSerializer());
  event.register("thermal:centrifuge", new ThermalRecipeSerializer());
  event.register("thermal:chiller", new ThermalRecipeSerializer());
  event.register("thermal:crucible", new ThermalRecipeSerializer());
  event.register("thermal:crystallizer", new ThermalRecipeSerializer());
  event.register("thermal:furnace", new ThermalRecipeSerializer());
  event.register("thermal:insolator", new ThermalRecipeSerializer());
  event.register(
    "thermal:insolator_catalyst",
    new ThermalCatalystRecipeSerializer(),
  );
  event.register("thermal:press", new ThermalRecipeSerializer());
  event.register("thermal:pulverizer", new ThermalRecipeSerializer());
  event.register("thermal:pulverizer_recycle", new ThermalRecipeSerializer());
  event.register(
    "thermal:pulverizer_catalyst",
    new ThermalCatalystRecipeSerializer(),
  );
  event.register("thermal:pyrolyzer", new ThermalRecipeSerializer());
  event.register("thermal:refinery", new ThermalRecipeSerializer());
  event.register("thermal:sawmill", new ThermalRecipeSerializer());
  event.register("thermal:smelter", new ThermalRecipeSerializer());
  event.register("thermal:smelter_recycle", new ThermalRecipeSerializer());
  event.register(
    "thermal:smelter_catalyst",
    new ThermalCatalystRecipeSerializer(),
  );
  event.register(
    "thermal:tree_extractor",
    new TreeExtractionRecipeSerializer(),
  );
  event.register("thermal:compression_fuel", new ThermalFuelRecipeSerializer());
  event.register("thermal:magmatic_fuel", new ThermalFuelRecipeSerializer());
  event.register("thermal:gourmand_fuel", new ThermalFuelRecipeSerializer());
  event.register("thermal:numismatic_fuel", new ThermalFuelRecipeSerializer());
}
