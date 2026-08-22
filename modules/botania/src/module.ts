import { defineModule } from "@adeficior/data-modifier-core";
import { name } from "../package.json";
import { BotaniaRecipeHelperImpl } from "./helper";
import type { BotaniaRecipeHelper } from "./helper";
import { registerSerializers } from "./registration";

export default defineModule<{
  services: {
    "helper:recipes:botania": BotaniaRecipeHelper;
  };
}>({
  importModule: name,
  dependencies: {
    "@adeficior/data-modifier-recipes": "required",
  },
  types: {
    services: {
      "helper:recipes:botania": "BotaniaRecipeHelper",
    },
  },
  promote: [{ service: "helper:recipes:botania", key: "recipes.botania" }],
  setup: (pack) => {
    pack.hook("recipes:register-serializer", registerSerializers);

    pack.service(
      "helper:recipes:botania",
      (container) =>
        new BotaniaRecipeHelperImpl(
          container.get("emitter:recipes"),
          container.get("serializer:ingredients"),
          container.get("serializer:results"),
        ),
    );
  },
});
