import type { Ingredient, Replacer, Result } from "../../io";

export type RecipeModifier = {
  result: Replacer<Result>;
  ingredient: Replacer<Ingredient>;
};
