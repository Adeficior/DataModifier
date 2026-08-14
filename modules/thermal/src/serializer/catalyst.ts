import type { Ingredient } from "@adeficior/data-modifier-ingredients";
import type {
  RecipeDefinition,
  RecipeModifier,
  RecipeParseContext,
} from "@adeficior/data-modifier-recipes";
import { Recipe, RecipeTypeSerializer } from "@adeficior/data-modifier-recipes";

export type ThermalCatalystRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredient: unknown;
    primary_mod?: number;
    secondary_mod?: number;
    energy_mod?: number;
    min_chance?: number;
    use_chance?: number;
  }>;

export class ThermalCatalystRecipe extends Recipe {
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
    return new ThermalCatalystRecipe(modifier.ingredient(this.ingredient));
  }
}

export class ThermalCatalystRecipeSerializer extends RecipeTypeSerializer<
  ThermalCatalystRecipeDefinition,
  ThermalCatalystRecipe
> {
  deserialize(
    definition: ThermalCatalystRecipeDefinition,
    context: RecipeParseContext,
  ): ThermalCatalystRecipe {
    const ingredient = context.ingredients.deserialize(definition.ingredient);
    return new ThermalCatalystRecipe(ingredient);
  }

  override serialize(
    recipe: ThermalCatalystRecipe,
    context: RecipeParseContext,
  ): Partial<ThermalCatalystRecipeDefinition> {
    return {
      ingredient: context.ingredients.serialize(recipe.ingredient),
    };
  }
}
