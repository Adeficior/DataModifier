import { encodeId } from "@adeficior/data-modifier-core";
import { IllegalShapeError } from "@adeficior/data-modifier-core/serializer";
import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import {
  FluidIngredient,
  FluidResult,
} from "@adeficior/data-modifier-ingredients";
import { RecipeTypeSerializer } from "@adeficior/data-modifier-recipes";
import type {
  Recipe,
  RecipeDefinition,
  RecipeModifier,
  RecipeParseContext,
  SerializedRecipe,
} from "@adeficior/data-modifier-recipes";

export type FluidConversionRecipeDefinition = RecipeDefinition &
  Readonly<{
    input: unknown;
    output: string;
  }>;

export class FluidConversionRecipe implements Recipe {
  constructor(
    readonly ingredient: Ingredient,
    readonly result: Result,
  ) {}

  getIngredients() {
    return [this.ingredient];
  }

  getResults() {
    return [this.result];
  }

  modify(modifier: RecipeModifier) {
    return new FluidConversionRecipe(
      modifier.ingredient(this.ingredient),
      modifier.result(this.result),
    );
  }
}

export class FluidConversionRecipeSerializer extends RecipeTypeSerializer<
  FluidConversionRecipeDefinition,
  FluidConversionRecipe
> {
  deserialize(
    definition: FluidConversionRecipeDefinition,
    context: RecipeParseContext,
  ): FluidConversionRecipe {
    const ingredient = context.ingredients.deserialize(definition.input);
    const result = context.results.validated(
      new FluidResult(definition.output, -1),
    );
    return new FluidConversionRecipe(ingredient, result);
  }

  override serialize(
    recipe: FluidConversionRecipe,
    context: RecipeParseContext,
  ): SerializedRecipe<FluidConversionRecipeDefinition> {
    if (!(recipe.result instanceof FluidIngredient)) {
      throw new IllegalShapeError(
        "fluid conversion output must be a fluid result",
        recipe.result,
      );
    }

    return {
      input: context.ingredients.serialize(recipe.ingredient),
      output: encodeId(recipe.result.id),
    };
  }
}
