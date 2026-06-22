import type { Ingredient } from "../../../common/ingredient/index.js";
import type { Result } from "../../../common/result/index.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { RecipeParseContext, Replacer } from "../index.js";
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
    definition: RecipeDefinition,
    private readonly ingredient: Ingredient,
    private readonly transitionalItem: Ingredient,
    private readonly results: Result[],
    private readonly sequence: Recipe[],
  ) {
    super(definition);
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

  override replace(
    ingredientReplacer: Replacer<Ingredient>,
    resultReplacer: Replacer<Result>,
  ) {
    return new AssemblyRecipe(
      this.definition,
      ingredientReplacer(this.ingredient),
      ingredientReplacer(this.transitionalItem),
      this.results.map(resultReplacer),
      this.sequence.map((it) => it.replace(ingredientReplacer, resultReplacer)),
    );
  }

  override serialize(
    context: RecipeParseContext,
  ): Partial<AssemblyRecipeDefinition> {
    return {
      ingredient: context.ingredients.serialize(this.ingredient),
      transitionalItem: context.ingredients.serialize(this.transitionalItem),
      results: context.ingredients.serializeList(this.results),
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
    const ingredient = context.ingredients.create(definition.ingredient);
    const transitionalItem = context.ingredients.create(
      definition.transitionalItem,
    );
    const results = context.results.createList(definition.results);
    const sequence = definition.sequence.map((it) =>
      context.recipes.deserialize(it),
    );
    return new AssemblyRecipe(
      definition,
      ingredient,
      transitionalItem,
      results,
      sequence,
    );
  }
}
