import type {
  RecipeDefinition,
  RecipeHolder,
  RecipeModifier,
  RecipeParseContext,
} from "@adeficior/data-modifier-recipes";
import { Recipe, RecipeTypeSerializer } from "@adeficior/data-modifier-recipes";

export type GogWrapperRecipeDefinition = RecipeDefinition &
  Readonly<{
    nbt: string;
    base: RecipeDefinition;
    gog: RecipeDefinition;
  }>;

export class GogWrapperRecipe extends Recipe {
  constructor(
    readonly base: RecipeHolder,
    readonly gog: RecipeHolder,
  ) {
    super();
  }

  getIngredients() {
    return [...this.base.getIngredients(), ...this.gog.getIngredients()];
  }

  getResults() {
    return [...this.base.getResults(), ...this.gog.getResults()];
  }

  override modify(modifier: RecipeModifier) {
    return new GogWrapperRecipe(
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
    return new GogWrapperRecipe(base, gog);
  }

  override serialize(
    recipe: GogWrapperRecipe,
    context: RecipeParseContext,
  ): Partial<GogWrapperRecipeDefinition> {
    return {
      base: context.recipes.serialize(recipe.base),
      gog: context.recipes.serialize(recipe.gog),
    };
  }
}
