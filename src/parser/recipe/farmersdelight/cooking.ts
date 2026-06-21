import { exists } from "@adeficior/pack-resolver";
import type {
  Ingredient,
  IngredientInput,
} from "../../../common/ingredient.js";
import type { Result, ResultInput } from "../../../common/result.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { Replacer } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";

export type CookingRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredients: Ingredient[];
    container?: Ingredient;
    result: Result;
    cookingTime?: number;
    experience?: number;
    recipe_book_tab?: string;
  }>;

export class CookingRecipe extends Recipe<CookingRecipeDefinition> {
  getIngredients(): IngredientInput[] {
    return [this.definition.container, ...this.definition.ingredients].filter(
      exists,
    );
  }

  getResults(): ResultInput[] {
    return [this.definition.result];
  }

  replaceIngredient(replace: Replacer<Ingredient>): Recipe {
    return new CookingRecipe({
      ...this.definition,
      container:
        this.definition.container && replace(this.definition.container),
      ingredients: this.definition.ingredients.map(replace),
    });
  }

  replaceResult(replace: Replacer<Result>): Recipe {
    return new CookingRecipe({
      ...this.definition,
      result: replace(this.definition.result),
    });
  }
}

export default class CookingRecipeParser extends RecipeParser<
  CookingRecipeDefinition,
  CookingRecipe
> {
  create(definition: CookingRecipeDefinition): CookingRecipe {
    return new CookingRecipe(definition);
  }
}
