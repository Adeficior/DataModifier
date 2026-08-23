import type { RecipeSerializerId } from "@adeficior/data-modifier/generated";
import type { RecipeTypeSerializer } from "./serializer/abstract";

export type RegisterRecipeSerializer = {
  register(recipeType: RecipeSerializerId, parser: RecipeTypeSerializer): void;
};
