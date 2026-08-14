import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import {
  ManyToOneRecipe,
  RecipeParser,
} from "@adeficior/data-modifier-recipes";
import type {
  ManyToOneRecipeDefinition,
  RecipeModifier,
  RecipeParseContext,
} from "@adeficior/data-modifier-recipes";

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

  override modify(modifier: RecipeModifier) {
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
    const ingredients = context.ingredients.deserializeList(
      definition.ingredients,
    );
    const result = context.results.deserialize(definition.result);
    const incenses =
      definition.incenses &&
      context.ingredients.deserializeList(definition.incenses);
    return new RootRitualRecipe(ingredients, result, incenses);
  }
}
