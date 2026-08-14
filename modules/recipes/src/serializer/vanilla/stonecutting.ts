import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import { Recipe } from "../../model";
import type { RecipeDefinition } from "../../schema";
import { RecipeTypeSerializer } from "../abstract";
import type { RecipeParseContext } from "../context";
import type { RecipeModifier } from "../modifier";

export type StonecuttingRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredient: unknown;
    result: unknown;
    count?: number;
  }>;

export class StonecuttingRecipe extends Recipe {
  constructor(
    readonly ingredient: Ingredient,
    readonly result: Result,
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
}

export class StonecuttingSerializer extends RecipeTypeSerializer<
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

  override serialize(
    recipe: StonecuttingRecipe,
    context: RecipeParseContext,
  ): Partial<StonecuttingRecipeDefinition> {
    return {
      ingredient: context.ingredients.serialize(recipe.ingredient),
      result: context.results.serialize(recipe.result),
    };
  }
}
