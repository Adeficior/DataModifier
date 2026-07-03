import type { Ingredient } from "../../../common/ingredient/index.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { RecipeModifier, RecipeParseContext } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";

export type RootComponentRecipeDefinition = RecipeDefinition &
  Readonly<{
    effect: string;
    ingredients: unknown[];
  }>;

export class RootComponentRecipe extends Recipe {
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
    return new RootComponentRecipe(this.ingredients.map(modifier.ingredient));
  }

  override serialize(
    context: RecipeParseContext,
  ): Partial<RootComponentRecipeDefinition> {
    return {
      ingredients: context.ingredients.serializeList(this.ingredients),
    };
  }
}

export class RootComponentRecipeParser extends RecipeParser<
  RootComponentRecipeDefinition,
  RootComponentRecipe
> {
  deserialize(
    definition: RootComponentRecipeDefinition,
    context: RecipeParseContext,
  ): RootComponentRecipe {
    const ingredients = context.ingredients.deserializeList(
      definition.ingredients,
    );
    return new RootComponentRecipe(ingredients);
  }
}
