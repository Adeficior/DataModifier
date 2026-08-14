import { RecipeTypeSerializer } from "@adeficior/data-modifier-recipes";
import type {
  Recipe,
  RecipeDefinition,
  RecipeHolder,
  RecipeModifier,
  RecipeParseContext,
  SerializedRecipe,
} from "@adeficior/data-modifier-recipes";

export type GogWrapperRecipeDefinition = RecipeDefinition &
  Readonly<{
    nbt: string;
    base: RecipeDefinition;
    gog: RecipeDefinition;
  }>;

export class GogWrapperRecipe implements Recipe {
  constructor(
    readonly nbt: string,
    readonly base: RecipeHolder,
    readonly gog: RecipeHolder,
  ) {}

  getIngredients() {
    return [...this.base.getIngredients(), ...this.gog.getIngredients()];
  }

  getResults() {
    return [...this.base.getResults(), ...this.gog.getResults()];
  }

  modify(modifier: RecipeModifier) {
    return new GogWrapperRecipe(
      this.nbt,
      this.base.modify(modifier),
      this.gog.modify(modifier),
    );
  }
}

export class GogWrapperRecipeSerializer extends RecipeTypeSerializer<
  GogWrapperRecipeDefinition,
  GogWrapperRecipe
> {
  override deserialize(
    definition: GogWrapperRecipeDefinition,
    context: RecipeParseContext,
  ): GogWrapperRecipe {
    const base = context.recipes.deserialize(definition.base);
    const gog = context.recipes.deserialize(definition.gog);
    return new GogWrapperRecipe(definition.nbt, base, gog);
  }

  override serialize(
    recipe: GogWrapperRecipe,
    context: RecipeParseContext,
  ): SerializedRecipe<GogWrapperRecipeDefinition> {
    return {
      nbt: recipe.nbt,
      base: context.recipes.serialize(recipe.base),
      gog: context.recipes.serialize(recipe.gog),
    };
  }
}
