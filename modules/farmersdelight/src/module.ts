import { defineModule } from "@adeficior/data-modifier-core";
import { name } from "../package.json";
import { CookingRecipeParser } from "./serializer/cooking";
import { CuttingRecipeParser } from "./serializer/cutting";

export default defineModule({
  importModule: name,
  dependencies: {
    "@adeficior/data-modifier-recipes": "required",
  },
  setup: (pack) => {
    pack.hook("recipes:register-parser", (event) => {
      event.register("farmersdelight:cooking", new CookingRecipeParser());
      event.register("farmersdelight:cutting", new CuttingRecipeParser());
      event.register("farmersrespite:brewing", new CookingRecipeParser());
    });
  },
});
