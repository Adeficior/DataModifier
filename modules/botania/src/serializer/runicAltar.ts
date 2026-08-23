import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import type { RecipeDefinition } from "@adeficior/data-modifier-recipes";
import type {
  RecipeParseContext,
  SerializedRecipe,
} from "@adeficior/data-modifier-recipes/serializer";
import {
  ManyToOneRecipe,
  RecipeTypeSerializer,
} from "@adeficior/data-modifier-recipes/serializer";

export type RunicAltarRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredients: unknown[];
    output: unknown;
    mana: number;
  }>;

export class RunicAltarRecipe extends ManyToOneRecipe {
  constructor(
    ingredients: Ingredient[],
    result: Result,
    readonly options: { mana: number },
  ) {
    super(ingredients, result);
  }
}

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
    return new RunicAltarRecipe(ingredients, result, { mana: definition.mana });
  }

  override serialize(
    recipe: RunicAltarRecipe,
    context: RecipeParseContext,
  ): SerializedRecipe<RunicAltarRecipeDefinition> {
    return {
      output: context.results.serialize(recipe.result),
      ingredients: context.ingredients.serializeList(recipe.ingredients),
      mana: recipe.options.mana,
    };
  }
}
