import type { RecipeSerializerId } from "@adeficior/data-modifier/generated";
import type { RecipeDefinition } from "./schema";
import type { Recipe, RecipeParser } from "./serializer/abstract";

export type RegisterRecipeParser = {
  register(
    recipeType: RecipeSerializerId,
    parser: RecipeParser<RecipeDefinition, Recipe>,
  ): void;
};
