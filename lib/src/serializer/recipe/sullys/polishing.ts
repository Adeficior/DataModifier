import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import type {
  ManyToOneRecipeDefinition,
  RecipeModifier,
  RecipeParseContext,
  SerializedRecipe,
} from "@adeficior/data-modifier-recipes";
import {
  ManyToOneRecipe,
  ManyToOneRecipeSerializer,
  RecipeTypeSerializer,
} from "@adeficior/data-modifier-recipes";

export type GrindstonePolishingDefinition = ManyToOneRecipeDefinition &
  Readonly<{
    experience?: number;
  }>;

export class GrindstonePolishingRecipe extends ManyToOneRecipe {
  constructor(
    ingredients: Ingredient[],
    result: Result,
    readonly options: {
      experience?: number;
    } = {},
  ) {
    super(ingredients, result);
  }

  override modify(modifier: RecipeModifier) {
    return new GrindstonePolishingRecipe(
      this.ingredients.map(modifier.ingredient),
      modifier.result(this.result),
      this.options,
    );
  }
}

export class GrindstonePolishingSerializer extends RecipeTypeSerializer<
  GrindstonePolishingDefinition,
  GrindstonePolishingRecipe
> {
  private inner = new ManyToOneRecipeSerializer();

  override deserialize(
    definition: GrindstonePolishingDefinition,
    context: RecipeParseContext,
  ) {
    const base = this.inner.deserialize(definition, context);
    return new GrindstonePolishingRecipe(base.ingredients, base.result, {
      experience: definition.experience,
    });
  }

  override serialize(
    recipe: GrindstonePolishingRecipe,
    context: RecipeParseContext,
  ): SerializedRecipe<GrindstonePolishingDefinition> {
    const base = this.inner.serialize(recipe, context);
    return {
      ...base,
      ...recipe.options,
    };
  }
}
