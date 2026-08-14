import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import type {
  RecipeDefinition,
  RecipeHolder,
  RecipeModifier,
  RecipeParseContext,
} from "@adeficior/data-modifier-recipes";
import { Recipe, RecipeTypeSerializer } from "@adeficior/data-modifier-recipes";

export type AssemblyRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredient: unknown;
    transitionalItem: unknown;
    transitional_item: unknown;
    results: unknown[];
    loops?: number;
    sequence: RecipeDefinition[];
  }>;

export class AssemblyRecipe extends Recipe {
  constructor(
    readonly ingredient: Ingredient,
    readonly transitionalItem: Ingredient,
    readonly results: Result[],
    readonly sequence: RecipeHolder[],
  ) {
    super();
  }

  getIngredients() {
    return [
      this.ingredient,
      this.transitionalItem,
      ...this.sequence.flatMap((it) => it.getIngredients()),
    ];
  }

  getResults() {
    return [...this.results, ...this.sequence.flatMap((it) => it.getResults())];
  }

  override modify(modifier: RecipeModifier) {
    return new AssemblyRecipe(
      modifier.ingredient(this.ingredient),
      modifier.ingredient(this.transitionalItem),
      this.results.map(modifier.result),
      this.sequence.map((it) => it.modify(modifier)),
    );
  }
}

export class AssemblyRecipeSerializer extends RecipeTypeSerializer<
  AssemblyRecipeDefinition,
  AssemblyRecipe
> {
  deserialize(
    definition: AssemblyRecipeDefinition,
    context: RecipeParseContext,
  ): AssemblyRecipe {
    const ingredient = context.ingredients.deserialize(definition.ingredient);

    const rawTransitionalItem =
      definition.transitionalItem ?? definition.transitional_item;
    const transitionalItem = context.results
      .deserialize(rawTransitionalItem)
      .asIngredient();
    const results = context.results.deserializeList(definition.results);
    const sequence = definition.sequence.map((it) =>
      context.recipes.deserialize(it),
    );
    return new AssemblyRecipe(ingredient, transitionalItem, results, sequence);
  }

  override serialize(
    recipe: AssemblyRecipe,
    context: RecipeParseContext,
  ): Partial<AssemblyRecipeDefinition> {
    return {
      ingredient: context.ingredients.serialize(recipe.ingredient),
      transitionalItem: context.results.serialize(
        recipe.transitionalItem.asResult(),
      ),
      results: context.results.serializeList(recipe.results),
      sequence: recipe.sequence.map((it) => context.recipes.serialize(it)),
    };
  }
}
