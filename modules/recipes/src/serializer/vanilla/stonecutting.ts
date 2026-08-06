import type { Ingredient, Result } from "@adeficior/data-modifier-core";
import type { RecipeDefinition } from "../../schema";
import { Recipe, RecipeParser } from "../abstract";
import type { RecipeParseContext } from "../context";
import type { RecipeModifier } from "../modifier";

export type StonecuttingRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredient: unknown;
    result: unknown;
    count?: number;
  }>;

// TODO could also be SmeltingRecipe?
export class StonecuttingRecipe extends Recipe {
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
    return new StonecuttingRecipe(
      modifier.ingredient(this.ingredient),
      modifier.result(this.result),
    );
  }

  override serialize(
    context: RecipeParseContext,
  ): Partial<StonecuttingRecipeDefinition> {
    return {
      ingredient: context.ingredients.serialize(this.ingredient),
      result: context.results.serialize(this.result),
    };
  }
}

export class StonecuttingParser extends RecipeParser<
  StonecuttingRecipeDefinition,
  StonecuttingRecipe
> {
  deserialize(
    definition: StonecuttingRecipeDefinition,
    context: RecipeParseContext,
  ): StonecuttingRecipe {
    const ingredient = context.ingredients.deserialize(definition.ingredient);
    const result = context.results.deserialize(definition.result);
    return new StonecuttingRecipe(ingredient, result);
  }
}
