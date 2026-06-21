import type { Replacer } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";
import type {
  Ingredient,
  IngredientInput,
} from "../../../common/ingredient.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { ResultInput } from "../../../common/result.js";

export type ThermalFuelRecipeDefinition = RecipeDefinition &
  Readonly<{
    energy: number;
    ingredient: Ingredient;
  }>;

export class ThermalFuelRecipe extends Recipe<ThermalFuelRecipeDefinition> {
  getIngredients(): IngredientInput[] {
    return [this.definition.ingredient];
  }

  getResults(): ResultInput[] {
    return [];
  }

  replaceIngredient(replace: Replacer<Ingredient>): Recipe {
    return new ThermalFuelRecipe({
      ...this.definition,
      ingredient: replace(this.definition.ingredient),
    });
  }

  replaceResult(): ThermalFuelRecipe {
    return new ThermalFuelRecipe(this.definition);
  }
}

export default class ThermalFuelRecipeParser extends RecipeParser<
  ThermalFuelRecipeDefinition,
  ThermalFuelRecipe
> {
  create(definition: ThermalFuelRecipeDefinition): ThermalFuelRecipe {
    return new ThermalFuelRecipe(definition);
  }
}
