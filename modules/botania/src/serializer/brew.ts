import { type Ingredient } from "@adeficior/data-modifier-ingredients";
import {
  Recipe,
  RecipeParser,
  type RecipeDefinition,
  type RecipeModifier,
  type RecipeParseContext,
} from "@adeficior/data-modifier-recipes";

export type BrewRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredients: unknown[];
    brew: string;
  }>;

export class BrewRecipe extends Recipe {
  constructor(private readonly ingredients: Ingredient[]) {
    super();
  }

  getIngredients() {
    return this.ingredients;
  }

  getResults() {
    return [];
  }

  override modify(modifier: RecipeModifier) {
    return new BrewRecipe(this.ingredients.map(modifier.ingredient));
  }

  override serialize(
    context: RecipeParseContext,
  ): Partial<BrewRecipeDefinition> {
    return {
      ingredients: context.ingredients.serializeList(this.ingredients),
    };
  }
}

export class BrewRecipeParser extends RecipeParser<
  BrewRecipeDefinition,
  BrewRecipe
> {
  deserialize(
    definition: BrewRecipeDefinition,
    context: RecipeParseContext,
  ): BrewRecipe {
    const ingredients = context.ingredients.deserializeList(
      definition.ingredients,
    );
    return new BrewRecipe(ingredients);
  }
}
