import { exists } from "@adeficior/pack-resolver";
import type { Ingredient } from "../../../common/ingredient/index.js";
import type { Result } from "../../../common/result/index.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { RecipeModifier, RecipeParseContext } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";

export type CookingRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredients: unknown[];
    container?: unknown;
    result: unknown;
    cookingTime?: number;
    experience?: number;
    recipe_book_tab?: string;
  }>;

export class CookingRecipe extends Recipe {
  constructor(
    private readonly ingredients: Ingredient[],
    private readonly result: Result,
    private readonly container?: Ingredient,
  ) {
    super();
  }

  getIngredients() {
    return [this.container, ...this.ingredients].filter(exists);
  }

  getResults() {
    return [this.result];
  }

  override modify(modifier: RecipeModifier) {
    return new CookingRecipe(
      this.ingredients.map(modifier.ingredient),
      modifier.result(this.result),
      this.container && modifier.ingredient(this.container),
    );
  }

  override serialize(
    context: RecipeParseContext,
  ): Partial<CookingRecipeDefinition> {
    return {
      ingredients: context.ingredients.serializeList(this.ingredients),
      result: context.results.serialize(this.result),
      container: context.ingredients.serializeOptional(this.container),
    };
  }
}

export default class CookingRecipeParser extends RecipeParser<
  CookingRecipeDefinition,
  CookingRecipe
> {
  deserialize(
    definition: CookingRecipeDefinition,
    context: RecipeParseContext,
  ): CookingRecipe {
    const ingredients = context.ingredients.deserializeList(
      definition.ingredients,
    );
    const result = context.results.deserialize(definition.result);
    const container = context.ingredients.deserializeOptional(
      definition.container,
    );
    return new CookingRecipe(ingredients, result, container);
  }
}
