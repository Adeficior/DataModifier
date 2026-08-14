import type { Ingredient } from "@adeficior/data-modifier-ingredients";
import type {
  RecipeDefinition,
  RecipeModifier,
  RecipeParseContext,
} from "@adeficior/data-modifier-recipes";
import { Recipe, RecipeTypeSerializer } from "@adeficior/data-modifier-recipes";

export type RootComponentRecipeDefinition = RecipeDefinition &
  Readonly<{
    effect: string;
    ingredients: unknown[];
  }>;

export class RootComponentRecipe extends Recipe {
  constructor(readonly ingredients: Ingredient[]) {
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
}

export class RootComponentRecipeSerializer extends RecipeTypeSerializer<
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

  override serialize(
    recipe: RootComponentRecipe,
    context: RecipeParseContext,
  ): Partial<RootComponentRecipeDefinition> {
    return {
      ingredients: context.ingredients.serializeList(recipe.ingredients),
    };
  }
}
