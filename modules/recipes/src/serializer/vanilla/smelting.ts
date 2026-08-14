import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import type { RecipeDefinition } from "../../schema";
import { Recipe, RecipeParser } from "../abstract";
import type { RecipeParseContext } from "../context";
import type { RecipeModifier } from "../modifier";

export type SmeltingRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredient: unknown;
    result: unknown;
    experience?: number;
  }>;

export class SmeltingRecipe extends Recipe {
  constructor(
    private readonly ingredient: Ingredient,
    private readonly result: Result,
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
    return new SmeltingRecipe(
      modifier.ingredient(this.ingredient),
      modifier.result(this.result),
    );
  }

  override serialize(
    context: RecipeParseContext,
  ): Partial<SmeltingRecipeDefinition> {
    return {
      ingredient: context.ingredients.serialize(this.ingredient),
      result: context.results.serialize(this.result),
    };
  }
}

export class SmeltingParser extends RecipeParser<
  SmeltingRecipeDefinition,
  SmeltingRecipe
> {
  deserialize(
    definition: SmeltingRecipeDefinition,
    context: RecipeParseContext,
  ): SmeltingRecipe {
    const ingredient = context.ingredients.deserialize(definition.ingredient);
    const result = context.results.deserialize(definition.result);
    return new SmeltingRecipe(ingredient, result);
  }
}
