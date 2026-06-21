import type {
  Ingredient,
  IngredientInput,
} from "../../../common/ingredient.js";
import type { Result, ResultInput } from "../../../common/result.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { Replacer } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";

export type HammeringRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredients: Ingredient[];
    result: Result;
  }>;

export class HammeringRecipe extends Recipe<HammeringRecipeDefinition> {
  getIngredients(): IngredientInput[] {
    return this.definition.ingredients;
  }

  getResults(): ResultInput[] {
    return [this.definition.result];
  }

  replaceIngredient(replace: Replacer<Ingredient>): Recipe {
    return new HammeringRecipe({
      ...this.definition,
      ingredients: this.definition.ingredients.map(replace),
    });
  }

  replaceResult(replace: Replacer<Result>): Recipe {
    return new HammeringRecipe({
      ...this.definition,
      result: replace(this.definition.result),
    });
  }
}

export default class HammeringRecipeParser extends RecipeParser<
  HammeringRecipeDefinition,
  HammeringRecipe
> {
  create(definition: HammeringRecipeDefinition): HammeringRecipe {
    return new HammeringRecipe(definition);
  }
}
