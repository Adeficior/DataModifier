import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import { Recipe } from "../model";
import type { RecipeDefinition } from "../schema";
import { RecipeTypeSerializer } from "./abstract";
import type { RecipeParseContext } from "./context";
import type { RecipeModifier } from "./modifier";

export type ManyToOneRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredients: unknown[];
    result: unknown;
  }>;

export class ManyToOneRecipe extends Recipe {
  constructor(
    readonly ingredients: Ingredient[],
    readonly result: Result,
  ) {
    super();
  }

  getIngredients() {
    return this.ingredients;
  }

  getResults() {
    return [this.result];
  }

  override modify(modifier: RecipeModifier) {
    return new ManyToOneRecipe(
      this.ingredients.map(modifier.ingredient),
      modifier.result(this.result),
    );
  }
}

export class ManyToOneRecipeSerializer<
  TDefinition extends ManyToOneRecipeDefinition,
> extends RecipeTypeSerializer<TDefinition, ManyToOneRecipe> {
  deserialize(
    definition: TDefinition,
    context: RecipeParseContext,
  ): ManyToOneRecipe {
    const ingredients = context.ingredients.deserializeList(
      definition.ingredients,
    );
    const result = context.results.deserialize(definition.result);
    return new ManyToOneRecipe(ingredients, result);
  }

  override serialize(recipe: ManyToOneRecipe, context: RecipeParseContext) {
    return {
      result: context.results.serialize(recipe.result),
      ingredients: context.ingredients.serializeList(recipe.ingredients),
    } as Partial<TDefinition>;
  }
}
