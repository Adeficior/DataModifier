import type { Ingredient } from "../../../common/ingredient/index.js";
import type { Result } from "../../../common/result/index.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { RecipeParseContext, Replacer } from "../index.js";
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
    definition: RecipeDefinition,
    private readonly ingredients: IngredientMap,
    private readonly result: Result,
  ) {
    super(definition);
  }

  getIngredients() {
    return this.ingredients.list();
  }

  getResults() {
    return [this.result];
  }

  replace(
    ingredientReplacer: Replacer<Ingredient>,
    resultReplacer: Replacer<Result>,
  ) {
    return new ShapedRecipe(
      this.definition,
      this.ingredients.replace(ingredientReplacer),
      resultReplacer(this.result),
    );
  }

  override serialize(
    context: RecipeParseContext,
  ): Partial<ShapedRecipeDefinition> {
    return {
      key: this.ingredients.serialize(context),
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
    const ingredients = context.ingredients.ingredientMap(definition.key);
    const result = context.results.create(definition.result);
    return new ShapedRecipe(definition, ingredients, result);
  }
}
