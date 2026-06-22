import type { Ingredient } from "../../../common/ingredient/index.js";
import type { Result } from "../../../common/result/index.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { RecipeParseContext, Replacer } from "../index.js";
import RecipeParser from "../index.js";
import {
  ManyToOneRecipe,
  type ManyToOneRecipeDefinition,
} from "../manyToOne.js";

export type RootRitualRecipeDefinition = ManyToOneRecipeDefinition &
  Readonly<{
    color: string;
    effect: string;
    level: number;
    incenses?: unknown[];
  }>;

export class RootRitualRecipe extends ManyToOneRecipe {
  constructor(
    definition: RecipeDefinition,
    ingredients: Ingredient[],
    result: Result,
    private readonly incenses: Ingredient[] = [],
  ) {
    super(definition, ingredients, result);
  }

  override getIngredients() {
    return [...super.getIngredients(), ...this.incenses];
  }

  override replace(
    ingredientReplacer: Replacer<Ingredient>,
    resultReplacer: Replacer<Result>,
  ) {
    return new RootRitualRecipe(
      this.definition,
      this.incenses.map(ingredientReplacer),
      resultReplacer(this.result),
      this.incenses.map(ingredientReplacer),
    );
  }
}

export class RootRitualRecipeParser extends RecipeParser<
  RootRitualRecipeDefinition,
  RootRitualRecipe
> {
  deserialize(
    definition: RootRitualRecipeDefinition,
    context: RecipeParseContext,
  ): RootRitualRecipe {
    const ingredients = context.ingredients.createList(definition.ingredients);
    const result = context.results.create(definition.result);
    const incenses =
      definition.incenses &&
      context.ingredients.createList(definition.incenses);
    return new RootRitualRecipe(definition, ingredients, result, incenses);
  }
}
