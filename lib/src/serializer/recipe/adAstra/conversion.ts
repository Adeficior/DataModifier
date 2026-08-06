import {
  encodeId,
  FluidIngredient,
  FluidResult,
  IllegalShapeError,
  type Ingredient,
  type Result,
} from "@adeficior/data-modifier-core";
import type {
  RecipeDefinition,
  RecipeModifier,
  RecipeParseContext,
} from "@adeficior/data-modifier-recipes";
import { Recipe, RecipeParser } from "@adeficior/data-modifier-recipes";

export type FluidConversionRecipeDefinition = RecipeDefinition &
  Readonly<{
    input: unknown;
    output: string;
  }>;

export class FluidConversionRecipe extends Recipe {
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
    return new FluidConversionRecipe(
      modifier.ingredient(this.ingredient),
      modifier.result(this.result),
    );
  }

  override serialize(
    context: RecipeParseContext,
  ): Partial<FluidConversionRecipeDefinition> {
    if (!(this.result instanceof FluidIngredient)) {
      throw new IllegalShapeError(
        "fluid conversion output must be a fluid result",
        this.result,
      );
    }

    return {
      input: context.ingredients.serialize(this.ingredient),
      output: encodeId(this.result.id),
    };
  }
}

export class FluidConversionRecipeParser extends RecipeParser<
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
}
