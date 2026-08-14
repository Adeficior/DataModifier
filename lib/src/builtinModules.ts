import {
  module as core,
  type CoreModuleOptions,
} from "@adeficior/data-modifier-core";
import ingredients from "@adeficior/data-modifier-ingredients";
import loot from "@adeficior/data-modifier-loot";
import recipes from "@adeficior/data-modifier-recipes";
import tags from "@adeficior/data-modifier-tags";
import { type DataModifierFactory } from "./instance";

export function installBuiltinModules(
  coreOptions: CoreModuleOptions,
): DataModifierFactory {
  return (builder) => {
    builder.install(tags);
    builder.install(ingredients);
    builder.install(recipes);
    builder.install(loot);
    builder.install(core, coreOptions);
  };
}
