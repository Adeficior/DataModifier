import type { Replacer } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";
import type {
  Ingredient,
  IngredientInput,
} from "../../../common/ingredient.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { ResultInput } from "../../../common/result.js";

export type ThermalCatalystRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredient: Ingredient;
    primary_mod?: number;
    secondary_mod?: number;
    energy_mod?: number;
    min_chance?: number;
    use_chance?: number;
  }>;

export class ThermalCatalystRecipe extends Recipe<ThermalCatalystRecipeDefinition> {
  getIngredients(): IngredientInput[] {
    return [this.definition.ingredient];
  }

  getResults(): ResultInput[] {
    return [];
  }

  replaceIngredient(replace: Replacer<Ingredient>): Recipe {
    return new ThermalCatalystRecipe({
      ...this.definition,
      ingredient: replace(this.definition.ingredient),
    });
  }

  replaceResult(): ThermalCatalystRecipe {
    return new ThermalCatalystRecipe(this.definition);
  }
}

export default class ThermalCatalystRecipeParser extends RecipeParser<
  ThermalCatalystRecipeDefinition,
  ThermalCatalystRecipe
> {
  create(definition: ThermalCatalystRecipeDefinition): ThermalCatalystRecipe {
    return new ThermalCatalystRecipe(definition);
  }
}
