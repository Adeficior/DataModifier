import type {
  Ingredient,
  Replacer,
  Result,
} from "@adeficior/data-modifier-core";

export type RecipeModifier = {
  result: Replacer<Result>;
  ingredient: Replacer<Ingredient>;
};
