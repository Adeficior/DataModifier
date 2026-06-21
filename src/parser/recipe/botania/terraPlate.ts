import type { Replacer } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";
import type {
  Ingredient,
  IngredientInput,
} from "../../../common/ingredient.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { Result, ResultInput } from "../../../common/result.js";

export type TerraPlateRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredients: Ingredient[];
    result: Result;
    mana?: number;
  }>;

export class TerraPlateRecipe extends Recipe<TerraPlateRecipeDefinition> {
  getIngredients(): IngredientInput[] {
    return this.definition.ingredients;
  }

  getResults(): ResultInput[] {
    return [this.definition.result];
  }

  replaceIngredient(replace: Replacer<Ingredient>): Recipe {
    return new TerraPlateRecipe({
      ...this.definition,
      ingredients: this.definition.ingredients.map(replace),
    });
  }

  replaceResult(replace: Replacer<Result>): Recipe {
    return new TerraPlateRecipe({
      ...this.definition,
      result: replace(this.definition.result),
    });
  }
}

export default class TerraPlateRecipeParser extends RecipeParser<
  TerraPlateRecipeDefinition,
  TerraPlateRecipe
> {
  create(definition: TerraPlateRecipeDefinition): TerraPlateRecipe {
    return new TerraPlateRecipe(definition);
  }
}
