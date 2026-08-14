import type { NormalizedId } from "@adeficior/data-modifier-core";
import { encodeId } from "@adeficior/data-modifier-core";
import { IllegalShapeError } from "@adeficior/data-modifier-core/serializer";
import type { Ingredient } from "@adeficior/data-modifier-ingredients";
import {
  ItemIngredient,
  ItemTagIngredient,
} from "@adeficior/data-modifier-ingredients";
import { RecipeTypeSerializer } from "@adeficior/data-modifier-recipes";
import type {
  Recipe,
  RecipeDefinition,
  RecipeModifier,
  RecipeParseContext,
  SerializedRecipe,
} from "@adeficior/data-modifier-recipes";
import { omit } from "lodash-es";
import * as z from "zod";

const WrappedIngredientSchema = z.object({
  ingredient: z.record(z.string(), z.unknown()),
  count: z.number().optional(),
});

export type SpaceStationRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredients: unknown[];
    dimension: string;
    structure: string;
  }>;

export class SpaceStationRecipe implements Recipe {
  constructor(
    // TODO these are IDs?
    readonly dimension: NormalizedId,
    readonly structure: NormalizedId,
    readonly ingredients: Ingredient[],
  ) {}

  getIngredients() {
    return this.ingredients;
  }

  getResults() {
    return [];
  }

  modify(modifier: RecipeModifier) {
    return new SpaceStationRecipe(
      this.dimension,
      this.structure,
      this.ingredients.map(modifier.ingredient),
    );
  }
}

export class SpaceStationRecipeSerializer extends RecipeTypeSerializer<
  SpaceStationRecipeDefinition,
  SpaceStationRecipe
> {
  deserialize(
    definition: SpaceStationRecipeDefinition,
    context: RecipeParseContext,
  ): SpaceStationRecipe {
    const ingredients = context.ingredients.deserializeList(
      definition.ingredients
        .map((it) => WrappedIngredientSchema.parse(it))
        .map((it) => ({ ...it.ingredient, count: it.count })),
    );

    return new SpaceStationRecipe(
      encodeId(definition.dimension),
      encodeId(definition.structure),
      ingredients,
    );
  }

  serialize(
    recipe: SpaceStationRecipe,
    context: RecipeParseContext,
  ): SerializedRecipe<SpaceStationRecipeDefinition> {
    return {
      dimension: recipe.dimension,
      structure: recipe.structure,
      ingredients: context.ingredients
        .serializeList(recipe.ingredients)
        .map((it) => {
          if (it instanceof ItemIngredient || it instanceof ItemTagIngredient) {
            return { ingredient: omit(it, "count"), count: it.count };
          }

          throw new IllegalShapeError(
            "space station ingredient needs to be a form of item",
            it,
          );
        }),
    };
  }
}
