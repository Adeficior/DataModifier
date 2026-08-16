import type { Ingredient } from "@adeficior/data-modifier-ingredients";
import type {
  Recipe,
  RecipeDefinition,
  RecipeModifier,
} from "@adeficior/data-modifier-recipes";
import type {
  RecipeParseContext,
  SerializedRecipe,
} from "@adeficior/data-modifier-recipes/serializer";
import { RecipeTypeSerializer } from "@adeficior/data-modifier-recipes/serializer";

export type ThermalFuelRecipeDefinition = RecipeDefinition &
  Readonly<{
    energy: number;
    ingredient: unknown;
  }>;

export class ThermalFuelRecipe implements Recipe {
  constructor(
    readonly ingredient: Ingredient,
    readonly options: { energy: number },
  ) {}

  getIngredients() {
    return [this.ingredient];
  }

  getResults() {
    return [];
  }

  modify(modifier: RecipeModifier) {
    return new ThermalFuelRecipe(
      modifier.ingredient(this.ingredient),
      this.options,
    );
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
    return new ThermalFuelRecipe(ingredient, { energy: definition.energy });
  }

  override serialize(
    recipe: ThermalFuelRecipe,
    context: RecipeParseContext,
  ): SerializedRecipe<ThermalFuelRecipeDefinition> {
    return {
      ingredient: context.ingredients.serialize(recipe.ingredient),
      energy: recipe.options.energy,
    };
  }
}
