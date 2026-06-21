import type { Replacer } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";
import type {
  Ingredient,
  IngredientInput,
} from "../../../common/ingredient.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { Result, ResultInput } from "../../../common/result.js";

export type RunicAltarRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredients: Ingredient[];
    output: Result;
    mana: number;
  }>;

export class RunicAltarRecipe extends Recipe<RunicAltarRecipeDefinition> {
  getIngredients(): IngredientInput[] {
    return this.definition.ingredients;
  }

  getResults(): ResultInput[] {
    return [this.definition.output];
  }

  replaceIngredient(replace: Replacer<Ingredient>): Recipe {
    return new RunicAltarRecipe({
      ...this.definition,
      ingredients: this.definition.ingredients.map(replace),
    });
  }

  replaceResult(replace: Replacer<Result>): Recipe {
    return new RunicAltarRecipe({
      ...this.definition,
      output: replace(this.definition.output),
    });
  }
}

export default class RunicAltarRecipeParser extends RecipeParser<
  RunicAltarRecipeDefinition,
  RunicAltarRecipe
> {
  create(definition: RunicAltarRecipeDefinition): RunicAltarRecipe {
    return new RunicAltarRecipe(definition);
  }
}
