import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import {
  ManyToOneRecipe,
  RecipeTypeSerializer,
} from "@adeficior/data-modifier-recipes";
import type {
  ManyToOneRecipeDefinition,
  RecipeParseContext,
  SerializedRecipe,
} from "@adeficior/data-modifier-recipes";

export type TerraPlateRecipeDefinition = ManyToOneRecipeDefinition &
  Readonly<{
    mana?: number;
  }>;

export class TerraPlateRecipe extends ManyToOneRecipe {
  constructor(
    ingredients: Ingredient[],
    result: Result,
    readonly options: { mana?: number } = {},
  ) {
    super(ingredients, result);
  }
}

export class TerraPlateRecipeSerializer extends RecipeTypeSerializer<
  TerraPlateRecipeDefinition,
  TerraPlateRecipe
> {
  override deserialize(
    definition: TerraPlateRecipeDefinition,
    context: RecipeParseContext,
  ) {
    return new TerraPlateRecipe(
      context.ingredients.deserializeList(definition.ingredients),
      context.results.deserialize(definition.result),
      {
        mana: definition.mana,
      },
    );
  }

  override serialize(
    recipe: TerraPlateRecipe,
    context: RecipeParseContext,
  ): SerializedRecipe<TerraPlateRecipeDefinition> {
    return {
      ingredients: context.ingredients.serializeList(recipe.ingredients),
      result: context.results.serialize(recipe.result),
      mana: recipe.options.mana,
    };
  }
}
