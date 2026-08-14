import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import { Recipe } from "../model";
import type { RecipeDefinition } from "../schema";
import { RecipeTypeSerializer } from "./abstract";
import type { RecipeParseContext } from "./context";
import type { RecipeModifier } from "./modifier";

export type ManyToManyRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredients: unknown[];
    results: unknown[];
  }>;

export class ManyToManyRecipe extends Recipe {
  constructor(
    protected readonly ingredients: Ingredient[],
    protected readonly results: Result[],
  ) {
    super();
  }

  getIngredients() {
    return this.ingredients;
  }

  getResults() {
    return this.results;
  }

  override modify(modifier: RecipeModifier) {
    return new ManyToManyRecipe(
      this.ingredients.map(modifier.ingredient),
      this.results.map(modifier.result),
    );
  }

  override serialize(
    context: RecipeParseContext,
  ): Partial<ManyToManyRecipeDefinition> {
    return {
      results: context.results.serializeList(this.results),
      ingredients: context.ingredients.serializeList(this.ingredients),
    };
  }
}

export class ManyToManyRecipeSerializer<
  TDefinition extends ManyToManyRecipeDefinition,
> extends RecipeTypeSerializer<TDefinition, ManyToManyRecipe> {
  deserialize(
    definition: TDefinition,
    context: RecipeParseContext,
  ): ManyToManyRecipe {
    const ingredients = context.ingredients.deserializeList(
      definition.ingredients,
    );
    const results = context.results.deserializeList(definition.results);
    return new ManyToManyRecipe(ingredients, results);
  }
}
