import type { Ingredient } from "../../../common/ingredient/index.js";
import type { Result } from "../../../common/result/index.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { RecipeHolder, RecipeParseContext, Replacer } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";

export type NbtWrapperRecipeDefinition = RecipeDefinition &
  Readonly<{
    nbt: string;
    recipe: RecipeDefinition;
  }>;

export class NbtWrapperRecipe extends Recipe {
  constructor(private readonly recipe: RecipeHolder) {
    super();
  }

  getIngredients() {
    return this.recipe.getIngredients();
  }

  getResults() {
    return this.recipe.getResults();
  }

  override replace(
    ingredientReplacer: Replacer<Ingredient>,
    resultReplacer: Replacer<Result>,
  ): Recipe {
    return new NbtWrapperRecipe(
      this.recipe.replace(ingredientReplacer, resultReplacer),
    );
  }

  override serialize(
    context: RecipeParseContext,
  ): Partial<NbtWrapperRecipeDefinition> {
    return {
      recipe: context.recipes.serialize(this.recipe),
    };
  }
}

export class NbtWrapperRecipeParser extends RecipeParser<
  NbtWrapperRecipeDefinition,
  NbtWrapperRecipe
> {
  deserialize(
    definition: NbtWrapperRecipeDefinition,
    context: RecipeParseContext,
  ): NbtWrapperRecipe {
    const recipe = context.recipes.deserialize(definition.recipe);
    return new NbtWrapperRecipe(recipe);
  }
}
