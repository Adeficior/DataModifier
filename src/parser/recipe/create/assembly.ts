import type { Ingredient } from "../../../common/ingredient/index.js";
import type { Result } from "../../../common/result/index.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type {
  RecipeHolder,
  RecipeModifier,
  RecipeParseContext,
} from "../index.js";
import RecipeParser, { Recipe } from "../index.js";

export type AssemblyRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredient: unknown;
    transitionalItem: unknown;
    results: unknown[];
    loops?: number;
    sequence: RecipeDefinition[];
  }>;

export class AssemblyRecipe extends Recipe {
  constructor(
    private readonly ingredient: Ingredient,
    private readonly transitionalItem: Ingredient,
    private readonly results: Result[],
    private readonly sequence: RecipeHolder[],
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

  override serialize(
    context: RecipeParseContext,
  ): Partial<AssemblyRecipeDefinition> {
    return {
      ingredient: context.ingredients.serialize(this.ingredient),
      transitionalItem: context.ingredients.serialize(this.transitionalItem),
      results: context.results.serializeList(this.results),
      sequence: this.sequence.map((it) => context.recipes.serialize(it)),
    };
  }
}

export class AssemblyRecipeParser extends RecipeParser<
  AssemblyRecipeDefinition,
  AssemblyRecipe
> {
  deserialize(
    definition: AssemblyRecipeDefinition,
    context: RecipeParseContext,
  ): AssemblyRecipe {
    const ingredient = context.ingredients.deserialize(definition.ingredient);
    const transitionalItem = context.ingredients.deserialize(
      definition.transitionalItem,
    );
    const results = context.results.createList(definition.results);
    const sequence = definition.sequence.map((it) =>
      context.recipes.deserialize(it),
    );
    return new AssemblyRecipe(ingredient, transitionalItem, results, sequence);
  }
}
