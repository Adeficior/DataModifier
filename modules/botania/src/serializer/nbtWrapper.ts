import type {
  RecipeDefinition,
  RecipeHolder,
  RecipeModifier,
  RecipeParseContext,
} from "@adeficior/data-modifier-recipes";
import { Recipe, RecipeTypeSerializer } from "@adeficior/data-modifier-recipes";

export type NbtWrapperRecipeDefinition = RecipeDefinition &
  Readonly<{
    nbt: string;
    recipe: RecipeDefinition;
  }>;

export class NbtWrapperRecipe extends Recipe {
  constructor(readonly recipe: RecipeHolder) {
    super();
  }

  getIngredients() {
    return this.recipe.getIngredients();
  }

  getResults() {
    return this.recipe.getResults();
  }

  override modify(modifier: RecipeModifier) {
    return new NbtWrapperRecipe(this.recipe.modify(modifier));
  }
}

export class NbtWrapperRecipeSerializer extends RecipeTypeSerializer<
  NbtWrapperRecipeDefinition,
  NbtWrapperRecipe
> {
  override deserialize(
    definition: NbtWrapperRecipeDefinition,
    context: RecipeParseContext,
  ): NbtWrapperRecipe {
    const recipe = context.recipes.deserialize(definition.recipe);
    return new NbtWrapperRecipe(recipe);
  }

  override serialize(
    recipe: NbtWrapperRecipe,
    context: RecipeParseContext,
  ): Partial<NbtWrapperRecipeDefinition> {
    return {
      recipe: context.recipes.serialize(recipe.recipe),
    };
  }
}
