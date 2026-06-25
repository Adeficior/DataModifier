import type { Ingredient } from "../../../common/ingredient/index.js";
import type { Result } from "../../../common/result/index.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { RecipeParseContext, Replacer } from "../index.js";
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

  override replace(
    ingredientReplacer: Replacer<Ingredient>,
    resultReplacer: Replacer<Result>,
  ) {
    return new SmithingRecipe(
      ingredientReplacer(this.base),
      ingredientReplacer(this.addition),
      resultReplacer(this.result),
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
    const base = context.ingredients.create(definition.base);
    const addition = context.ingredients.create(definition.addition);
    const result = context.results.create(definition.result);
    return new SmithingRecipe(base, addition, result);
  }
}
