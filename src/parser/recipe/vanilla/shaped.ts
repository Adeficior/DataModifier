import type { Result } from "../../../common/result/index.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { RecipeModifier, RecipeParseContext } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";
import type { IngredientMap, IngredientMapInput } from "../ingredientMap.js";

export type ShapedRecipeDefinition = RecipeDefinition &
  Readonly<{
    key: IngredientMapInput;
    pattern: string[];
    result: unknown;
  }>;

export class ShapedRecipe extends Recipe {
  constructor(
    private readonly ingredients: IngredientMap,
    private readonly result: Result,
  ) {
    super();
  }

  getIngredients() {
    return this.ingredients.list();
  }

  getResults() {
    return [this.result];
  }

  override modify(modifier: RecipeModifier) {
    return new ShapedRecipe(
      this.ingredients.replace(modifier.ingredient),
      modifier.result(this.result),
    );
  }

  override serialize(
    context: RecipeParseContext,
  ): Partial<ShapedRecipeDefinition> {
    return {
      key: context.ingredients.serializeIngredientMap(this.ingredients),
      result: context.results.serialize(this.result),
    };
  }
}

export class ShapedParser extends RecipeParser<
  ShapedRecipeDefinition,
  ShapedRecipe
> {
  deserialize(
    definition: ShapedRecipeDefinition,
    context: RecipeParseContext,
  ): ShapedRecipe {
    const ingredients = context.ingredients.deserializeIngredientMap(
      definition.key,
    );
    const result = context.results.deserialize(definition.result);
    return new ShapedRecipe(ingredients, result);
  }
}
