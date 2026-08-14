import type {
  RecipeDefinition,
  RecipeParseContext,
} from "@adeficior/data-modifier-recipes";
import {
  ManyToManyRecipe,
  RecipeTypeSerializer,
} from "@adeficior/data-modifier-recipes";

export type ElvenTradeRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredients: unknown[];
    output: unknown[];
    mana?: number;
  }>;

export class ElvenTradeRecipe extends ManyToManyRecipe {}

export class ElvenTradeRecipeSerializer extends RecipeTypeSerializer<
  ElvenTradeRecipeDefinition,
  ElvenTradeRecipe
> {
  deserialize(
    definition: ElvenTradeRecipeDefinition,
    context: RecipeParseContext,
  ): ElvenTradeRecipe {
    const ingredients = context.ingredients.deserializeList(
      definition.ingredients,
    );
    const results = context.results.deserializeList(definition.output);
    return new ElvenTradeRecipe(ingredients, results);
  }

  override serialize(
    recipe: ElvenTradeRecipe,
    context: RecipeParseContext,
  ): Partial<ElvenTradeRecipeDefinition> {
    return {
      output: context.results.serializeList(recipe.results),
      ingredients: context.ingredients.serializeList(recipe.ingredients),
    };
  }
}
