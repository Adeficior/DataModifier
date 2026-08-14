import type { Replacer } from "@adeficior/data-modifier-core/serializer";
import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";

export type RecipeModifier = {
  result: Replacer<Result>;
  ingredient: Replacer<Ingredient>;
};
