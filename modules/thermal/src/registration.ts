import type { RegisterRecipeParser } from "@adeficior/data-modifier-recipes";
import { ThermalRecipeParser } from "./serializer";
import { ThermalCatalystRecipeParser } from "./serializer/catalyst";
import { ThermalFuelRecipeParser } from "./serializer/fuel";
import { TreeExtractionRecipeParser } from "./serializer/treeExtraction";

export function registerParsers(event: RegisterRecipeParser) {
  event.register("thermal:bottler", new ThermalRecipeParser());
  event.register("thermal:centrifuge", new ThermalRecipeParser());
  event.register("thermal:chiller", new ThermalRecipeParser());
  event.register("thermal:crucible", new ThermalRecipeParser());
  event.register("thermal:crystallizer", new ThermalRecipeParser());
  event.register("thermal:furnace", new ThermalRecipeParser());
  event.register("thermal:insolator", new ThermalRecipeParser());
  event.register(
    "thermal:insolator_catalyst",
    new ThermalCatalystRecipeParser(),
  );
  event.register("thermal:press", new ThermalRecipeParser());
  event.register("thermal:pulverizer", new ThermalRecipeParser());
  event.register("thermal:pulverizer_recycle", new ThermalRecipeParser());
  event.register(
    "thermal:pulverizer_catalyst",
    new ThermalCatalystRecipeParser(),
  );
  event.register("thermal:pyrolyzer", new ThermalRecipeParser());
  event.register("thermal:refinery", new ThermalRecipeParser());
  event.register("thermal:sawmill", new ThermalRecipeParser());
  event.register("thermal:smelter", new ThermalRecipeParser());
  event.register("thermal:smelter_recycle", new ThermalRecipeParser());
  event.register("thermal:smelter_catalyst", new ThermalCatalystRecipeParser());
  event.register("thermal:tree_extractor", new TreeExtractionRecipeParser());
  event.register("thermal:compression_fuel", new ThermalFuelRecipeParser());
  event.register("thermal:magmatic_fuel", new ThermalFuelRecipeParser());
  event.register("thermal:gourmand_fuel", new ThermalFuelRecipeParser());
  event.register("thermal:numismatic_fuel", new ThermalFuelRecipeParser());
}
