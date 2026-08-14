import type { Ingredient } from "@adeficior/data-modifier-ingredients";
import type {
  RecipeDefinition,
  RecipeModifier,
  RecipeParseContext,
} from "@adeficior/data-modifier-recipes";
import { Recipe, RecipeTypeSerializer } from "@adeficior/data-modifier-recipes";

export type ThermalFuelRecipeDefinition = RecipeDefinition &
  Readonly<{
    energy: number;
    ingredient: unknown;
  }>;

// TODO could be same as catalyst
export class ThermalFuelRecipe extends Recipe {
  constructor(readonly ingredient: Ingredient) {
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
}

export class ThermalFuelRecipeSerializer extends RecipeTypeSerializer<
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

  override serialize(
    recipe: ThermalFuelRecipe,
    context: RecipeParseContext,
  ): Partial<ThermalFuelRecipeDefinition> {
    return {
      ingredient: context.ingredients.serialize(recipe.ingredient),
    };
  }
}
