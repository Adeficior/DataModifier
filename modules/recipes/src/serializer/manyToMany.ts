import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import type { Recipe } from "../model";
import type { RecipeDefinition } from "../schema";
import { RecipeTypeSerializer } from "./abstract";
import type { SerializedRecipe } from "./abstract";
import type { RecipeParseContext } from "./context";
import type { RecipeModifier } from "./modifier";

export type ManyToManyRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredients: unknown[];
    results: unknown[];
  }>;

export class ManyToManyRecipe implements Recipe {
  constructor(
    readonly ingredients: Ingredient[],
    readonly results: Result[],
  ) {}

  getIngredients() {
    return this.ingredients;
  }

  getResults() {
    return this.results;
  }

  modify(modifier: RecipeModifier) {
    return new ManyToManyRecipe(
      this.ingredients.map(modifier.ingredient),
      this.results.map(modifier.result),
    );
  }
}

export class ManyToManyRecipeSerializer extends RecipeTypeSerializer<
  ManyToManyRecipeDefinition,
  ManyToManyRecipe
> {
  deserialize(
    definition: ManyToManyRecipeDefinition,
    context: RecipeParseContext,
  ): ManyToManyRecipe {
    const ingredients = context.ingredients.deserializeList(
      definition.ingredients,
    );
    const results = context.results.deserializeList(definition.results);
    return new ManyToManyRecipe(ingredients, results);
  }

  override serialize(
    recipe: ManyToManyRecipe,
    context: RecipeParseContext,
  ): SerializedRecipe<ManyToManyRecipeDefinition> {
    return {
      results: context.results.serializeList(recipe.results),
      ingredients: context.ingredients.serializeList(recipe.ingredients),
    };
  }
}
