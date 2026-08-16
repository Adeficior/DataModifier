import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import type { Recipe } from "../model";
import type { RecipeDefinition } from "../schema";
import { RecipeTypeSerializer } from "./abstract";
import type { SerializedRecipe } from "./abstract";
import type { RecipeParseContext } from "./context";
import type { RecipeModifier } from "./modifier";

export type ManyToOneRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredients: unknown[];
    result: unknown;
  }>;

export class ManyToOneRecipe implements Recipe {
  constructor(
    readonly ingredients: Ingredient[],
    readonly result: Result,
  ) {}

  getIngredients() {
    return this.ingredients;
  }

  getResults() {
    return [this.result];
  }

  modify(modifier: RecipeModifier) {
    return new ManyToOneRecipe(
      this.ingredients.map(modifier.ingredient),
      modifier.result(this.result),
    );
  }
}

export class ManyToOneRecipeSerializer extends RecipeTypeSerializer<
  ManyToOneRecipeDefinition,
  ManyToOneRecipe
> {
  deserialize(
    definition: ManyToOneRecipeDefinition,
    context: RecipeParseContext,
  ): ManyToOneRecipe {
    const ingredients = context.ingredients.deserializeList(
      definition.ingredients,
    );
    const result = context.results.deserialize(definition.result);
    return new ManyToOneRecipe(ingredients, result);
  }

  override serialize(
    recipe: ManyToOneRecipe,
    context: RecipeParseContext,
  ): SerializedRecipe<ManyToOneRecipeDefinition> {
    return {
      result: context.results.serialize(recipe.result),
      ingredients: context.ingredients.serializeList(recipe.ingredients),
    };
  }
}
