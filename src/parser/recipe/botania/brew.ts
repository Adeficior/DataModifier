import type { Ingredient } from "../../../common/ingredient/index.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { RecipeModifier, RecipeParseContext } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";

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

  override replace(modifier: RecipeModifier) {
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
    const ingredients = context.ingredients.createList(definition.ingredients);
    return new BrewRecipe(ingredients);
  }
}
