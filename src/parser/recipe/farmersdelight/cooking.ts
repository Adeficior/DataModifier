import { exists } from "@adeficior/pack-resolver";
import type { Ingredient } from "../../../common/ingredient/index.js";
import type { Result } from "../../../common/result/index.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { RecipeParseContext, Replacer } from "../index.js";
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
    definition: RecipeDefinition,
    private readonly ingredients: Ingredient[],
    private readonly result: Result,
    private readonly container?: Ingredient,
  ) {
    super(definition);
  }

  getIngredients() {
    return [this.container, ...this.ingredients].filter(exists);
  }

  getResults() {
    return [this.result];
  }

  override replace(
    ingredientReplacer: Replacer<Ingredient>,
    resultReplacer: Replacer<Result>,
  ) {
    return new CookingRecipe(
      this.definition,
      this.ingredients.map(ingredientReplacer),
      resultReplacer(this.result),
      this.container && ingredientReplacer(this.container),
    );
  }

  override serialize(
    context: RecipeParseContext,
  ): Partial<CookingRecipeDefinition> {
    return {
      ingredients: context.ingredients.serializeList(this.ingredients),
      result: context.results.serialize(this.result),
      container:
        this.container && context.ingredients.serialize(this.container),
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
    const ingredients = context.ingredients.createList(definition.ingredients);
    const result = context.results.create(definition.result);
    // TODO optional serialize & deserialize?
    const container =
      definition.container === undefined
        ? undefined
        : context.ingredients.create(definition.container);
    return new CookingRecipe(definition, ingredients, result, container);
  }
}
