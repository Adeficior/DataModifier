import {
  module as core,
  type ModuleConfig,
} from "@adeficior/data-modifier-core";
import ingredients from "@adeficior/data-modifier-ingredients";
import loot from "@adeficior/data-modifier-loot";
import recipes from "@adeficior/data-modifier-recipes";
import tags from "@adeficior/data-modifier-tags";

export function builtInModules() {
  return [tags, ingredients, recipes, loot, core] as ModuleConfig[];
}
