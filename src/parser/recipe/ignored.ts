import { Recipe } from "./index.js";
import type { IngredientInput } from "../../common/ingredient.js";
import type { ResultInput } from "../../common/result.js";
import type { RecipeDefinition } from "../../schema/data/recipe.js";

export default class IgnoredRecipe<
  T extends RecipeDefinition,
> extends Recipe<T> {
  getIngredients(): IngredientInput[] {
    return [];
  }

  getResults(): ResultInput[] {
    return [];
  }

  replaceIngredient(): Recipe {
    return new IgnoredRecipe(this.definition);
  }

  replaceResult(): Recipe {
    return new IgnoredRecipe(this.definition);
  }
}
