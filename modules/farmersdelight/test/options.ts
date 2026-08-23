import { recipeModuleOptions } from "@adeficior/data-modifier-recipes/testing";
import { registerSerializers } from "../src/registration";

export const recipeOptions = recipeModuleOptions(
  "farmersdelight",
  registerSerializers,
);
