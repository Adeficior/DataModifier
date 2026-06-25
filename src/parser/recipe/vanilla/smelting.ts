import type { Ingredient } from "../../../common/ingredient/index.js";
import type { Result } from "../../../common/result/index.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { RecipeModifier, RecipeParseContext } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";

export type SmeltingRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredient: unknown;
    result: unknown;
    experience?: number;
  }>;

export class SmeltingRecipe extends Recipe {
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

  override replace(modifier: RecipeModifier) {
    return new SmeltingRecipe(
      modifier.ingredient(this.ingredient),
      modifier.result(this.result),
    );
  }

  override serialize(
    context: RecipeParseContext,
  ): Partial<SmeltingRecipeDefinition> {
    return {
      ingredient: context.ingredients.serialize(this.ingredient),
      result: context.results.serialize(this.result),
    };
  }
}

export class SmeltingParser extends RecipeParser<
  SmeltingRecipeDefinition,
  SmeltingRecipe
> {
  deserialize(
    definition: SmeltingRecipeDefinition,
    context: RecipeParseContext,
  ): SmeltingRecipe {
    const ingredient = context.ingredients.create(definition.ingredient);
    const result = context.results.create(definition.result);
    return new SmeltingRecipe(ingredient, result);
  }
}
