import type { NormalizedId } from "@adeficior/data-modifier-core";
import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import type { RecipeModifier } from "./serializer/modifier";

export abstract class Recipe {
  abstract getIngredients(): Ingredient[];

  abstract getResults(): Result[];

  abstract modify(modifier: RecipeModifier): Recipe;

  additionalTypes(): NormalizedId[] {
    return [];
  }
}
