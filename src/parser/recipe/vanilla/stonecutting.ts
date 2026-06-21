import type { ItemId } from "@adeficior/data-modifier/generated";
import { encodeId } from "../../../common/id.js";
import type {
  Ingredient,
  IngredientInput,
} from "../../../common/ingredient.js";
import type { Result, ResultInput } from "../../../common/result.js";
import { createResult } from "../../../common/result.js";
import { IllegalShapeError } from "../../../error.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { Replacer } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";

export type StonecuttingRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredient: Ingredient;
    result: ItemId;
    count?: number;
  }>;

export class StonecuttingRecipe extends Recipe<StonecuttingRecipeDefinition> {
  getIngredients(): IngredientInput[] {
    return [this.definition.ingredient];
  }

  getResults(): ResultInput[] {
    return [
      { item: encodeId(this.definition.result), count: this.definition.count },
    ];
  }

  replaceIngredient(replace: Replacer<Ingredient>): Recipe {
    return new StonecuttingRecipe({
      ...this.definition,
      ingredient: replace(this.definition.ingredient),
    });
  }

  replaceResult(replace: Replacer<Result>): Recipe {
    const result = createResult(replace);
    if (!("item" in result))
      throw new IllegalShapeError(
        "stonecutting does only support item results",
        result,
      );

    return new StonecuttingRecipe({
      ...this.definition,
      result: result.item,
      count: result.count ?? 1,
    });
  }
}

export default class StonecuttingParser extends RecipeParser<
  StonecuttingRecipeDefinition,
  StonecuttingRecipe
> {
  create(definition: StonecuttingRecipeDefinition): StonecuttingRecipe {
    return new StonecuttingRecipe(definition);
  }
}
