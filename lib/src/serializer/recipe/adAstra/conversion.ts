import type { RecipeModifier, RecipeParseContext } from "..";
import RecipeSerializer, { Recipe } from "..";
import { encodeId } from "../../../common/id";
import { FluidIngredient, type Ingredient } from "../../../common/ingredient";
import type { Result } from "../../../common/result";
import { FluidResult } from "../../../common/result";
import { IllegalShapeError } from "../../../error";
import type { RecipeDefinition } from "../../../schema/data/recipe";

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

export class FluidConversionRecipeParser extends RecipeSerializer<
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
