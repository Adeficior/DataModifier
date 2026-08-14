import { RecipeTypeSerializer } from "@adeficior/data-modifier-recipes";
import type {
  Recipe,
  RecipeDefinition,
  RecipeHolder,
  RecipeModifier,
  RecipeParseContext,
  SerializedRecipe,
} from "@adeficior/data-modifier-recipes";

export type NbtWrapperRecipeDefinition = RecipeDefinition &
  Readonly<{
    nbt: string;
    recipe: RecipeDefinition;
  }>;

export class NbtWrapperRecipe implements Recipe {
  constructor(
    readonly nbt: string,
    readonly recipe: RecipeHolder,
  ) {}

  getIngredients() {
    return this.recipe.getIngredients();
  }

  getResults() {
    return this.recipe.getResults();
  }

  modify(modifier: RecipeModifier) {
    return new NbtWrapperRecipe(this.nbt, this.recipe.modify(modifier));
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
    return new NbtWrapperRecipe(definition.nbt, recipe);
  }

  override serialize(
    recipe: NbtWrapperRecipe,
    context: RecipeParseContext,
  ): SerializedRecipe<NbtWrapperRecipeDefinition> {
    return {
      nbt: recipe.nbt,
      recipe: context.recipes.serialize(recipe.recipe),
    };
  }
}
