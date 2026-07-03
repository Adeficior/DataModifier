import type { Ingredient } from "../../common/ingredient/index.js";
import type { Result } from "../../common/result/index.js";
import type { RecipeDefinition } from "../../schema/data/recipe.js";
import RecipeParser, {
  Recipe,
  type RecipeModifier,
  type RecipeParseContext,
} from "./index.js";

export type OneToOneRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredient: unknown;
    result: unknown;
  }>;

export class OneToOneRecipe extends Recipe {
  constructor(
    protected readonly ingredient: Ingredient,
    protected readonly result: Result,
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
    return new OneToOneRecipe(
      modifier.ingredient(this.ingredient),
      modifier.result(this.result),
    );
  }

  override serialize(
    context: RecipeParseContext,
  ): Partial<OneToOneRecipeDefinition> {
    return {
      result: context.results.serialize(this.result),
      ingredient: context.ingredients.serialize(this.ingredient),
    };
  }
}

export class OneToOneRecipeParser<
  TDefinition extends OneToOneRecipeDefinition,
> extends RecipeParser<TDefinition, OneToOneRecipe> {
  deserialize(
    definition: TDefinition,
    context: RecipeParseContext,
  ): OneToOneRecipe {
    const ingredient = context.ingredients.deserialize(definition.ingredient);
    const result = context.results.deserialize(definition.result);
    return new OneToOneRecipe(ingredient, result);
  }
}
