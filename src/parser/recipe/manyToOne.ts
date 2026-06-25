import type { Ingredient } from "../../common/ingredient/index.js";
import type { Result } from "../../common/result/index.js";
import type { RecipeDefinition } from "../../schema/data/recipe.js";
import RecipeParser, {
  Recipe,
  type RecipeParseContext,
  type Replacer,
} from "./index.js";

export type ManyToOneRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredients: unknown[];
    result: unknown;
  }>;

export class ManyToOneRecipe extends Recipe {
  constructor(
    protected readonly ingredients: Ingredient[],
    protected readonly result: Result,
  ) {
    super();
  }

  getIngredients() {
    return this.ingredients;
  }

  getResults() {
    return [this.result];
  }

  override replace(
    ingredientReplacer: Replacer<Ingredient>,
    resultReplacer: Replacer<Result>,
  ) {
    return new ManyToOneRecipe(
      this.ingredients.map(ingredientReplacer),
      resultReplacer(this.result),
    );
  }

  override serialize(
    context: RecipeParseContext,
  ): Partial<ManyToOneRecipeDefinition> {
    return {
      result: context.results.serialize(this.result),
      ingredients: context.ingredients.serializeList(this.ingredients),
    };
  }
}

export class ManyToOneRecipeParser<
  TDefinition extends ManyToOneRecipeDefinition,
> extends RecipeParser<TDefinition, ManyToOneRecipe> {
  deserialize(
    definition: TDefinition,
    context: RecipeParseContext,
  ): ManyToOneRecipe {
    const ingredients = context.ingredients.createList(definition.ingredients);
    const result = context.results.create(definition.result);
    return new ManyToOneRecipe(ingredients, result);
  }
}
