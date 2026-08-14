import { IllegalShapeError } from "@adeficior/data-modifier-core/serializer";
import type { Ingredient } from "@adeficior/data-modifier-ingredients";
import {
  ItemIngredient,
  ItemTagIngredient,
} from "@adeficior/data-modifier-ingredients";
import type {
  RecipeDefinition,
  RecipeModifier,
  RecipeParseContext,
} from "@adeficior/data-modifier-recipes";
import { Recipe, RecipeTypeSerializer } from "@adeficior/data-modifier-recipes";
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

export class SpaceStationRecipe extends Recipe {
  constructor(readonly ingredients: Ingredient[]) {
    super();
  }

  getIngredients() {
    return this.ingredients;
  }

  getResults() {
    return [];
  }

  override modify(modifier: RecipeModifier) {
    return new SpaceStationRecipe(this.ingredients.map(modifier.ingredient));
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

    return new SpaceStationRecipe(ingredients);
  }

  serialize(
    recipe: SpaceStationRecipe,
    context: RecipeParseContext,
  ): Partial<SpaceStationRecipeDefinition> {
    return {
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
