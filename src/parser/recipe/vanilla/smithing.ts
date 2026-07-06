import { notNull } from "@adeficior/pack-resolver";
import type { Ingredient } from "../../../common/ingredient/index.js";
import type { Result } from "../../../common/result/index.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { RecipeModifier, RecipeParseContext } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";

export type SmithingRecipeDefinition = RecipeDefinition &
  Readonly<{
    base: unknown;
    addition: unknown;
    result?: unknown;
    template?: unknown;
  }>;

export class SmithingRecipe extends Recipe {
  constructor(
    private readonly base: Ingredient,
    private readonly addition: Ingredient,
    private readonly result: Result | undefined,
    private readonly template: Ingredient | undefined,
  ) {
    super();
  }

  getIngredients() {
    return [this.base, this.addition, this.template].filter(notNull);
  }

  getResults() {
    return [this.result].filter(notNull);
  }

  override modify(modifier: RecipeModifier) {
    return new SmithingRecipe(
      modifier.ingredient(this.base),
      modifier.ingredient(this.addition),
      this.result && modifier.result(this.result),
      this.template && modifier.ingredient(this.template),
    );
  }

  override serialize(
    context: RecipeParseContext,
  ): Partial<SmithingRecipeDefinition> {
    return {
      base: context.ingredients.serialize(this.base),
      addition: context.ingredients.serialize(this.addition),
      result: context.results.serializeOptional(this.result),
      template: context.ingredients.serializeOptional(this.template),
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
    const result = context.results.deserializeOptional(definition.result);
    const template = context.ingredients.deserializeOptional(
      definition.addition,
    );
    return new SmithingRecipe(base, addition, result, template);
  }
}
