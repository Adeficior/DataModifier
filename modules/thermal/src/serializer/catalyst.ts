import type { Ingredient } from "@adeficior/data-modifier-ingredients";
import { RecipeTypeSerializer } from "@adeficior/data-modifier-recipes";
import type {
  Recipe,
  RecipeDefinition,
  RecipeModifier,
  RecipeParseContext,
  SerializedRecipe,
} from "@adeficior/data-modifier-recipes";

type CatalystOptions = Readonly<{
  primary_mod?: number;
  secondary_mod?: number;
  energy_mod?: number;
  min_chance?: number;
  use_chance?: number;
}>;

export type ThermalCatalystRecipeDefinition = RecipeDefinition &
  CatalystOptions &
  Readonly<{
    ingredient: unknown;
  }>;

export class ThermalCatalystRecipe implements Recipe {
  constructor(
    readonly ingredient: Ingredient,
    readonly options: CatalystOptions = {},
  ) {}

  getIngredients() {
    return [this.ingredient];
  }

  getResults() {
    return [];
  }

  modify(modifier: RecipeModifier) {
    return new ThermalCatalystRecipe(
      modifier.ingredient(this.ingredient),
      this.options,
    );
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
    return new ThermalCatalystRecipe(ingredient, {
      energy_mod: definition.energy_mod,
      min_chance: definition.min_chance,
      primary_mod: definition.primary_mod,
      secondary_mod: definition.secondary_mod,
      use_chance: definition.use_chance,
    });
  }

  override serialize(
    recipe: ThermalCatalystRecipe,
    context: RecipeParseContext,
  ): SerializedRecipe<ThermalCatalystRecipeDefinition> {
    return {
      ingredient: context.ingredients.serialize(recipe.ingredient),
      ...recipe.options,
    };
  }
}
