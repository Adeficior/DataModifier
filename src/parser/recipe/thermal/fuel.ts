import type { Ingredient } from "../../../common/ingredient/index.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { RecipeModifier, RecipeParseContext } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";

export type ThermalFuelRecipeDefinition = RecipeDefinition &
  Readonly<{
    energy: number;
    ingredient: unknown;
  }>;

// TODO could be same as catalyst
export class ThermalFuelRecipe extends Recipe {
  constructor(private readonly ingredient: Ingredient) {
    super();
  }

  getIngredients() {
    return [this.ingredient];
  }

  getResults() {
    return [];
  }

  override modify(modifier: RecipeModifier) {
    return new ThermalFuelRecipe(modifier.ingredient(this.ingredient));
  }

  override serialize(
    context: RecipeParseContext,
  ): Partial<ThermalFuelRecipeDefinition> {
    return {
      ingredient: context.ingredients.serialize(this.ingredient),
    };
  }
}

export class ThermalFuelRecipeParser extends RecipeParser<
  ThermalFuelRecipeDefinition,
  ThermalFuelRecipe
> {
  deserialize(
    definition: ThermalFuelRecipeDefinition,
    context: RecipeParseContext,
  ): ThermalFuelRecipe {
    const ingredient = context.ingredients.deserialize(definition.ingredient);
    return new ThermalFuelRecipe(ingredient);
  }
}
