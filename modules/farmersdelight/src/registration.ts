import type { RegisterRecipeSerializer } from "@adeficior/data-modifier-recipes";
import { CookingRecipeSerializer } from "./serializer/cooking";
import { CuttingRecipeSerializer } from "./serializer/cutting";

export function registerSerializers(event: RegisterRecipeSerializer) {
  event.register("farmersdelight:cooking", new CookingRecipeSerializer());
  event.register("farmersdelight:cutting", new CuttingRecipeSerializer());
  event.register("farmersrespite:brewing", new CookingRecipeSerializer());
}
