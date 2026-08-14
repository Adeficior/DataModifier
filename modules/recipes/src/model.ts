import type { NormalizedId } from "@adeficior/data-modifier-core";
import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import type { RecipeModifier } from "./serializer/modifier";

export type Recipe = {
  getIngredients(): Ingredient[];

  getResults(): Result[];

  modify(modifier: RecipeModifier): Recipe;

  additionalTypes?(): NormalizedId[];
};
