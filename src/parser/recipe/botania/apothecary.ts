import type { Ingredient } from "../../../common/ingredient/index.js";
import type { Result } from "../../../common/result/index.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import RecipeParser, {
  Recipe,
  type RecipeParseContext,
  type Replacer,
} from "../index.js";

export type ApothecaryRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredients: unknown[];
    output: unknown;
    reagent: unknown;
  }>;

export class ApothecaryRecipe extends Recipe {
  constructor(
    protected readonly ingredients: Ingredient[],
    protected readonly result: Result,
    protected readonly reagent: Ingredient,
  ) {
    super();
  }

  override getIngredients() {
    return [...this.ingredients, this.reagent];
  }

  override getResults() {
    return [this.result];
  }

  override replace(
    ingredientReplacer: Replacer<Ingredient>,
    resultReplacer: Replacer<Result>,
  ) {
    return new ApothecaryRecipe(
      this.ingredients.map(ingredientReplacer),
      resultReplacer(this.result),
      ingredientReplacer(this.reagent),
    );
  }

  override serialize(
    context: RecipeParseContext,
  ): Partial<ApothecaryRecipeDefinition> {
    return {
      ingredients: context.ingredients.serializeList(this.ingredients),
      output: context.results.serialize(this.result),
      reagent: context.ingredients.serialize(this.reagent),
    };
  }
}

export class ApothecaryRecipeParser extends RecipeParser<
  ApothecaryRecipeDefinition,
  ApothecaryRecipe
> {
  deserialize(
    definition: ApothecaryRecipeDefinition,
    context: RecipeParseContext,
  ): ApothecaryRecipe {
    const ingredients = context.ingredients.createList(definition.ingredients);
    const result = context.results.create(definition.output);
    const reagent = context.ingredients.create(definition.ingredients);
    return new ApothecaryRecipe(ingredients, result, reagent);
  }
}
