import type { Ingredient } from "../../../common/ingredient/index.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { RecipeModifier, RecipeParseContext } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";

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
  constructor(private readonly ingredient: Ingredient) {
    super();
  }

  getIngredients() {
    return [this.ingredient];
  }

  getResults() {
    return [];
  }

  override replace(modifier: RecipeModifier) {
    return new ThermalCatalystRecipe(modifier.ingredient(this.ingredient));
  }

  override serialize(
    context: RecipeParseContext,
  ): Partial<ThermalCatalystRecipeDefinition> {
    return {
      ingredient: context.ingredients.serialize(this.ingredient),
    };
  }
}

export class ThermalCatalystRecipeParser extends RecipeParser<
  ThermalCatalystRecipeDefinition,
  ThermalCatalystRecipe
> {
  deserialize(
    definition: ThermalCatalystRecipeDefinition,
    context: RecipeParseContext,
  ): ThermalCatalystRecipe {
    const ingredient = context.ingredients.create(definition.ingredient);
    return new ThermalCatalystRecipe(ingredient);
  }
}
