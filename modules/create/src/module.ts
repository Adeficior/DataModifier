import { defineModule } from "@adeficior/data-modifier-core";
import { name } from "../package.json";
import { CreateRecipeHelperImpl } from "./helper";
import type { CreateRecipeHelper } from "./helper";
import { registerSerializers } from "./registration";

export default defineModule<{
  services: {
    "helper:recipes:create": CreateRecipeHelper;
  };
}>({
  importModule: name,
  dependencies: {
    "@adeficior/data-modifier-recipes": "required",
  },
  types: {
    services: {
      "helper:recipes:create": "CreateRecipeHelper",
    },
  },
  promote: [{ service: "helper:recipes:create", key: "recipes.create" }],
  setup: (pack) => {
    pack.hook("recipes:register-serializer", registerSerializers);

    pack.service(
      "helper:recipes:create",
      (container) =>
        new CreateRecipeHelperImpl(
          container.get("emitter:recipes"),
          container.get("serializer:ingredients"),
          container.get("serializer:results"),
        ),
    );
  },
});
