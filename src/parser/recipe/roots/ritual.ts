import type { Ingredient } from "../../../common/ingredient/index.js";
import type { Result } from "../../../common/result/index.js";
import type { RecipeModifier, RecipeParseContext } from "../index.js";
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
    ingredients: Ingredient[],
    result: Result,
    private readonly incenses: Ingredient[] = [],
  ) {
    super(ingredients, result);
  }

  override getIngredients() {
    return [...super.getIngredients(), ...this.incenses];
  }

  override replace(modifier: RecipeModifier) {
    return new RootRitualRecipe(
      this.incenses.map(modifier.ingredient),
      modifier.result(this.result),
      this.incenses.map(modifier.ingredient),
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
    const result = context.results.deserialize(definition.result);
    const incenses =
      definition.incenses &&
      context.ingredients.createList(definition.incenses);
    return new RootRitualRecipe(ingredients, result, incenses);
  }
}
