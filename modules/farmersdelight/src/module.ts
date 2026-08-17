import { defineModule } from "@adeficior/data-modifier-core";
import { name } from "../package.json";
import type { FarmersDelightRecipeHelper } from "./helper";
import { registerSerializers } from "./registration";

export default defineModule<{
  services: {
    "helper:recipes:farmers_delight": FarmersDelightRecipeHelper;
  };
}>({
  importModule: name,
  dependencies: {
    "@adeficior/data-modifier-recipes": "required",
  },
  types: {
    services: {
      "helper:recipes:farmers_delight": "FarmersDelightRecipeHelper",
    },
  },
  promote: [
    {
      service: "helper:recipes:farmers_delight",
      key: "recipes.farmers_delight",
    },
  ],
  setup: (pack) => {
    pack.hook("recipes:register-serializer", registerSerializers);
  },
});
