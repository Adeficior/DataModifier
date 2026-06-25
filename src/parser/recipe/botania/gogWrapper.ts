import type { Ingredient } from "../../../common/ingredient/index.js";
import type { Result } from "../../../common/result/index.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { RecipeHolder, RecipeParseContext, Replacer } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";

export type GogWrapperRecipeDefinition = RecipeDefinition &
  Readonly<{
    nbt: string;
    base: RecipeDefinition;
    gog: RecipeDefinition;
  }>;

export class GogWrapperRecipe extends Recipe {
  constructor(
    private readonly base: RecipeHolder,
    private readonly gog: RecipeHolder,
  ) {
    super();
  }

  getIngredients() {
    return [...this.base.getIngredients(), ...this.gog.getIngredients()];
  }

  getResults() {
    return [...this.base.getResults(), ...this.gog.getResults()];
  }

  override replace(
    ingredientReplacer: Replacer<Ingredient>,
    resultReplacer: Replacer<Result>,
  ) {
    return new GogWrapperRecipe(
      this.base.replace(ingredientReplacer, resultReplacer),
      this.gog.replace(ingredientReplacer, resultReplacer),
    );
  }

  override serialize(
    context: RecipeParseContext,
  ): Partial<GogWrapperRecipeDefinition> {
    return {
      base: context.recipes.serialize(this.base),
      gog: context.recipes.serialize(this.gog),
    };
  }
}

export class GogWrapperRecipeParser extends RecipeParser<
  GogWrapperRecipeDefinition,
  GogWrapperRecipe
> {
  deserialize(
    definition: GogWrapperRecipeDefinition,
    context: RecipeParseContext,
  ): GogWrapperRecipe {
    const base = context.recipes.deserialize(definition.base);
    const gog = context.recipes.deserialize(definition.gog);
    return new GogWrapperRecipe(base, gog);
  }
}
