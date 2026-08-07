import {
  type Ingredient,
  type Replacer,
  type Result,
} from "@adeficior/data-modifier-core";

export type RecipeModifier = {
  result: Replacer<Result>;
  ingredient: Replacer<Ingredient>;
};
