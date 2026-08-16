import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import type {
  Recipe,
  RecipeDefinition,
  RecipeModifier,
} from "@adeficior/data-modifier-recipes";
import type {
  RecipeHolder,
  RecipeParseContext,
  SerializedRecipe,
} from "@adeficior/data-modifier-recipes/serializer";
import { RecipeTypeSerializer } from "@adeficior/data-modifier-recipes/serializer";

export type AssemblyRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredient: unknown;
    transitionalItem?: unknown;
    transitional_item?: unknown;
    results: unknown[];
    loops?: number;
    sequence: RecipeDefinition[];
  }>;

export class AssemblyRecipe implements Recipe {
  constructor(
    readonly ingredient: Ingredient,
    readonly transitionalItem: Ingredient,
    readonly results: Result[],
    readonly sequence: RecipeHolder[],
    readonly options: { loops?: number } = {},
  ) {}

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

  modify(modifier: RecipeModifier) {
    return new AssemblyRecipe(
      modifier.ingredient(this.ingredient),
      modifier.ingredient(this.transitionalItem),
      this.results.map(modifier.result),
      this.sequence.map((it) => it.modify(modifier)),
      this.options,
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
    return new AssemblyRecipe(ingredient, transitionalItem, results, sequence, {
      loops: definition.loops,
    });
  }

  override serialize(
    recipe: AssemblyRecipe,
    context: RecipeParseContext,
  ): SerializedRecipe<AssemblyRecipeDefinition> {
    return {
      ingredient: context.ingredients.serialize(recipe.ingredient),
      // TODO use transitional_item depending on pack format
      transitionalItem: context.results.serialize(
        recipe.transitionalItem.asResult(),
      ),
      results: context.results.serializeList(recipe.results),
      sequence: recipe.sequence.map((it) => context.recipes.serialize(it)),
      ...recipe.options,
    };
  }
}
