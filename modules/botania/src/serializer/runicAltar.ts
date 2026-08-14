import type {
  RecipeDefinition,
  RecipeParseContext,
} from "@adeficior/data-modifier-recipes";
import {
  ManyToOneRecipe,
  RecipeTypeSerializer,
} from "@adeficior/data-modifier-recipes";

export type RunicAltarRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredients: unknown[];
    output: unknown;
    mana: number;
  }>;

export class RunicAltarRecipe extends ManyToOneRecipe {}

export class RunicAltarRecipeSerializer extends RecipeTypeSerializer<
  RunicAltarRecipeDefinition,
  RunicAltarRecipe
> {
  deserialize(
    definition: RunicAltarRecipeDefinition,
    context: RecipeParseContext,
  ): RunicAltarRecipe {
    const ingredients = context.ingredients.deserializeList(
      definition.ingredients,
    );
    const result = context.results.deserialize(definition.output);
    return new RunicAltarRecipe(ingredients, result);
  }

  override serialize(
    recipe: RunicAltarRecipe,
    context: RecipeParseContext,
  ): Partial<RunicAltarRecipeDefinition> {
    return {
      output: context.results.serialize(recipe.result),
      ingredients: context.ingredients.serializeList(recipe.ingredients),
    };
  }
}
