import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type {
  RecipeHolder,
  RecipeModifier,
  RecipeParseContext,
} from "../index.js";
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

  override replace(modifier: RecipeModifier) {
    return new NbtWrapperRecipe(this.recipe.replace(modifier));
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
