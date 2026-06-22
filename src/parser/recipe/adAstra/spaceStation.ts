import { omit } from "lodash-es";
import z from "zod";
import {
  ItemIngredient,
  ItemTagIngredient,
  type Ingredient,
} from "../../../common/ingredient/index.js";
import { IllegalShapeError } from "../../../error.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { RecipeParseContext, Replacer } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";

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
  constructor(
    definition: RecipeDefinition,
    private readonly ingredients: Ingredient[],
  ) {
    super(definition);
  }

  getIngredients() {
    return this.ingredients;
  }

  getResults() {
    return [];
  }

  replace(ingredientReplacer: Replacer<Ingredient>) {
    return new SpaceStationRecipe(
      this.definition,
      this.ingredients.map(ingredientReplacer),
    );
  }

  serialize(
    context: RecipeParseContext,
  ): Partial<SpaceStationRecipeDefinition> {
    return {
      ingredients: context.ingredients
        .serializeList(this.ingredients)
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

export class SpaceStationRecipeParser extends RecipeParser<
  SpaceStationRecipeDefinition,
  SpaceStationRecipe
> {
  deserialize(
    definition: SpaceStationRecipeDefinition,
    context: RecipeParseContext,
  ): SpaceStationRecipe {
    const ingredients = context.ingredients.createList(
      definition.ingredients
        .map((it) => WrappedIngredientSchema.parse(it))
        .map((it) => ({ ...it.ingredient, count: it.count })),
    );

    return new SpaceStationRecipe(definition, ingredients);
  }
}
