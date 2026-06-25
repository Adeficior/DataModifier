import { encodeId } from "../../../common/id.js";
import {
  FluidIngredient,
  type Ingredient,
} from "../../../common/ingredient/index.js";
import type { Result } from "../../../common/result/index.js";
import { FluidResult } from "../../../common/result/index.js";
import { IllegalShapeError } from "../../../error.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { RecipeParseContext, Replacer } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";

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

  override replace(
    ingredientReplacer: Replacer<Ingredient>,
    resultReplacer: Replacer<Result>,
  ) {
    return new FluidConversionRecipe(
      ingredientReplacer(this.ingredient),
      resultReplacer(this.result),
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
    const ingredient = context.ingredients.create(definition.input);
    const result = context.results.validated(
      new FluidResult(definition.output, -1),
    );
    return new FluidConversionRecipe(ingredient, result);
  }
}
