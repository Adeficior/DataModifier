import type { Ingredient } from "../../../common/ingredient/index.js";
import type { Result } from "../../../common/result/index.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { RecipeModifier, RecipeParseContext } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";

export type SmithingRecipeDefinition = RecipeDefinition &
  Readonly<{
    base: unknown;
    addition: unknown;
    result: unknown;
  }>;

export class SmithingRecipe extends Recipe {
  constructor(
    private readonly base: Ingredient,
    private readonly addition: Ingredient,
    private readonly result: Result,
  ) {
    super();
  }

  getIngredients() {
    return [this.base, this.addition];
  }

  getResults() {
    return [this.result];
  }

  override modify(modifier: RecipeModifier) {
    return new SmithingRecipe(
      modifier.ingredient(this.base),
      modifier.ingredient(this.addition),
      modifier.result(this.result),
    );
  }

  override serialize(
    context: RecipeParseContext,
  ): Partial<SmithingRecipeDefinition> {
    return {
      base: context.ingredients.serialize(this.base),
      addition: context.ingredients.serialize(this.addition),
      result: context.results.serialize(this.result),
    };
  }
}

export class SmithingParser extends RecipeParser<
  SmithingRecipeDefinition,
  SmithingRecipe
> {
  deserialize(
    definition: SmithingRecipeDefinition,
    context: RecipeParseContext,
  ): SmithingRecipe {
    const base = context.ingredients.deserialize(definition.base);
    const addition = context.ingredients.deserialize(definition.addition);
    const result = context.results.deserialize(definition.result);
    return new SmithingRecipe(base, addition, result);
  }
}
