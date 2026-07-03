import type { Ingredient } from "../../common/ingredient/index.js";
import type { Result } from "../../common/result/index.js";
import type { RecipeDefinition } from "../../schema/data/recipe.js";
import RecipeParser, {
  Recipe,
  type RecipeModifier,
  type RecipeParseContext,
} from "./index.js";

export type ManyToManyRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredients: unknown[];
    results: unknown[];
  }>;

export class ManyToManyRecipe extends Recipe {
  constructor(
    protected readonly ingredients: Ingredient[],
    protected readonly results: Result[],
  ) {
    super();
  }

  getIngredients() {
    return this.ingredients;
  }

  getResults() {
    return this.results;
  }

  override modify(modifier: RecipeModifier) {
    return new ManyToManyRecipe(
      this.ingredients.map(modifier.ingredient),
      this.results.map(modifier.result),
    );
  }

  override serialize(
    context: RecipeParseContext,
  ): Partial<ManyToManyRecipeDefinition> {
    return {
      results: context.results.serializeList(this.results),
      ingredients: context.ingredients.serializeList(this.ingredients),
    };
  }
}

export class ManyToManyRecipeParser<
  TDefinition extends ManyToManyRecipeDefinition,
> extends RecipeParser<TDefinition, ManyToManyRecipe> {
  deserialize(
    definition: TDefinition,
    context: RecipeParseContext,
  ): ManyToManyRecipe {
    const ingredients = context.ingredients.createList(definition.ingredients);
    const results = context.results.createList(definition.results);
    return new ManyToManyRecipe(ingredients, results);
  }
}
