import { type RegisterRecipeParser } from "@adeficior/data-modifier-recipes";
import { CookingRecipeParser } from "./serializer/cooking";
import { CuttingRecipeParser } from "./serializer/cutting";

export function registerParsers(event: RegisterRecipeParser) {
  event.register("farmersdelight:cooking", new CookingRecipeParser());
  event.register("farmersdelight:cutting", new CuttingRecipeParser());
  event.register("farmersrespite:brewing", new CookingRecipeParser());
}
