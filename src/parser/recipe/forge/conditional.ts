import type { Ingredient } from "../../../common/ingredient/index.js";
import type { Result } from "../../../common/result/index.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { RecipeHolder, RecipeParseContext, Replacer } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";

type WithConditions<T> = {
  conditions: unknown[];
  recipe: T;
};

export type ForgeConditionalRecipeDefinition = RecipeDefinition &
  Readonly<{
    recipes: WithConditions<RecipeDefinition>[];
  }>;

export class ForgeConditionalRecipe extends Recipe {
  constructor(private readonly recipes: WithConditions<RecipeHolder>[]) {
    super();
  }

  getIngredients() {
    return this.recipes.flatMap((it) => it.recipe.getIngredients());
  }

  getResults() {
    return this.recipes.flatMap((it) => it.recipe.getResults());
  }

  override replace(
    ingredientReplacer: Replacer<Ingredient>,
    resultReplacer: Replacer<Result>,
  ) {
    return new ForgeConditionalRecipe(
      this.recipes.map((it) => ({
        ...it,
        recipe: it.recipe.replace(ingredientReplacer, resultReplacer),
      })),
    );
  }

  override serialize(
    context: RecipeParseContext,
  ): Partial<ForgeConditionalRecipeDefinition> {
    return {
      recipes: this.recipes.map((it) => ({
        ...it,
        recipe: context.recipes.serialize(it.recipe),
      })),
    };
  }

  override additionalTypes() {
    return this.recipes.flatMap((it) => it.recipe.getTypes());
  }
}

export default class ForgeConditionalRecipeParser extends RecipeParser<
  ForgeConditionalRecipeDefinition,
  ForgeConditionalRecipe
> {
  override deserialize(
    definition: ForgeConditionalRecipeDefinition,
    context: RecipeParseContext,
  ): ForgeConditionalRecipe {
    const recipes = definition.recipes.map<WithConditions<RecipeHolder>>(
      (it) => ({
        conditions: it.conditions,
        recipe: context.recipes.deserialize(it.recipe),
      }),
    );

    return new ForgeConditionalRecipe(recipes);
  }
}
