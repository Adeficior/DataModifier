import { defineModule } from "@adeficior/data-modifier-core";
import { name } from "../package.json";
import type { ThermalRecipeHelper } from "./helper";
import { registerSerializers } from "./registration";

export default defineModule<{
  services: {
    "helper:recipes:thermal": ThermalRecipeHelper;
  };
}>({
  importModule: name,
  dependencies: {
    "@adeficior/data-modifier-recipes": "required",
  },
  types: {
    services: {
      "helper:recipes:thermal": "ThermalRecipeHelper",
    },
  },
  promote: [{ service: "helper:recipes:thermal", key: "recipes.thermal" }],
  setup: (pack) => {
    pack.hook("recipes:register-serializer", registerSerializers);
  },
});
