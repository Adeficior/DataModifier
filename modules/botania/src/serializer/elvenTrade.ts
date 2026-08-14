import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import type {
  RecipeDefinition,
  RecipeParseContext,
  SerializedRecipe,
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

export class ElvenTradeRecipe extends ManyToManyRecipe {
  constructor(
    ingredients: Ingredient[],
    results: Result[],
    readonly options: { mana?: number } = {},
  ) {
    super(ingredients, results);
  }
}

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
    return new ElvenTradeRecipe(ingredients, results, {
      mana: definition.mana,
    });
  }

  override serialize(
    recipe: ElvenTradeRecipe,
    context: RecipeParseContext,
  ): SerializedRecipe<ElvenTradeRecipeDefinition> {
    return {
      output: context.results.serializeList(recipe.results),
      ingredients: context.ingredients.serializeList(recipe.ingredients),
      mana: recipe.options.mana,
    };
  }
}
