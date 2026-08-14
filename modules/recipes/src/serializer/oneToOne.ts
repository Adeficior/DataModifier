import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import { Recipe } from "../model";
import type { RecipeDefinition } from "../schema";
import { RecipeTypeSerializer } from "./abstract";
import type { RecipeParseContext } from "./context";
import type { RecipeModifier } from "./modifier";

export type OneToOneRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredient: unknown;
    result: unknown;
  }>;

export class OneToOneRecipe extends Recipe {
  constructor(
    protected readonly ingredient: Ingredient,
    protected readonly result: Result,
  ) {
    super();
  }

  getIngredients() {
    return [this.ingredient];
  }

  getResults() {
    return [this.result];
  }

  override modify(modifier: RecipeModifier) {
    return new OneToOneRecipe(
      modifier.ingredient(this.ingredient),
      modifier.result(this.result),
    );
  }

  override serialize(
    context: RecipeParseContext,
  ): Partial<OneToOneRecipeDefinition> {
    return {
      result: context.results.serialize(this.result),
      ingredient: context.ingredients.serialize(this.ingredient),
    };
  }
}

export class OneToOneRecipeSerializer<
  TDefinition extends OneToOneRecipeDefinition,
> extends RecipeTypeSerializer<TDefinition, OneToOneRecipe> {
  deserialize(
    definition: TDefinition,
    context: RecipeParseContext,
  ): OneToOneRecipe {
    const ingredient = context.ingredients.deserialize(definition.ingredient);
    const result = context.results.deserialize(definition.result);
    return new OneToOneRecipe(ingredient, result);
  }
}
