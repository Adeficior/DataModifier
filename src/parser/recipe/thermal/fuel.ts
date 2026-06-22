import type { Ingredient } from "../../../common/ingredient/index.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { RecipeParseContext, Replacer } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";

export type ThermalFuelRecipeDefinition = RecipeDefinition &
  Readonly<{
    energy: number;
    ingredient: unknown;
  }>;

// TODO could be same as catalyst
export class ThermalFuelRecipe extends Recipe {
  constructor(
    definition: RecipeDefinition,
    private readonly ingredient: Ingredient,
  ) {
    super(definition);
  }

  getIngredients() {
    return [this.ingredient];
  }

  getResults() {
    return [];
  }

  override replace(ingredientReplacer: Replacer<Ingredient>): Recipe {
    return new ThermalFuelRecipe(
      this.definition,
      ingredientReplacer(this.ingredient),
    );
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
    const ingredient = context.ingredients.create(definition.ingredient);
    return new ThermalFuelRecipe(definition, ingredient);
  }
}
