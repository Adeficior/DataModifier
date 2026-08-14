import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import type {
  ManyToOneRecipeDefinition,
  RecipeModifier,
  RecipeParseContext,
} from "@adeficior/data-modifier-recipes";
import {
  ManyToOneRecipe,
  RecipeTypeSerializer,
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
    readonly incenses: Ingredient[] = [],
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

export class RootRitualRecipeSerializer extends RecipeTypeSerializer<
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

  override serialize(
    recipe: RootRitualRecipe,
    context: RecipeParseContext,
  ): Partial<RootRitualRecipeDefinition> {
    return {
      result: context.results.serialize(recipe.result),
      ingredients: context.ingredients.serializeList(recipe.ingredients),
      incenses: context.ingredients.serializeList(recipe.incenses),
    };
  }
}
