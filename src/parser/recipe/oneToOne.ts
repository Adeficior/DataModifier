import type { Ingredient } from "../../common/ingredient/index.js";
import type { Result } from "../../common/result/index.js";
import type { RecipeDefinition } from "../../schema/data/recipe.js";
import RecipeParser, {
  Recipe,
  type RecipeParseContext,
  type Replacer,
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

  override replace(
    ingredientReplacer: Replacer<Ingredient>,
    resultReplacer: Replacer<Result>,
  ) {
    return new OneToOneRecipe(
      ingredientReplacer(this.ingredient),
      resultReplacer(this.result),
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
    const ingredient = context.ingredients.create(definition.ingredient);
    const result = context.results.create(definition.result);
    return new OneToOneRecipe(ingredient, result);
  }
}
