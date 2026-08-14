import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import { Recipe } from "../../model";
import type { RecipeDefinition } from "../../schema";
import { RecipeTypeSerializer } from "../abstract";
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
    return new SmeltingRecipe(
      modifier.ingredient(this.ingredient),
      modifier.result(this.result),
    );
  }
}

export class SmeltingSerializer extends RecipeTypeSerializer<
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

  override serialize(
    recipe: SmeltingRecipe,
    context: RecipeParseContext,
  ): Partial<SmeltingRecipeDefinition> {
    return {
      ingredient: context.ingredients.serialize(recipe.ingredient),
      result: context.results.serialize(recipe.result),
    };
  }
}
