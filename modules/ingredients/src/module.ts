import { defineModule } from "@adeficior/data-modifier-core";
import { name } from "../package.json";
import { createPredicates, type Predicates } from "./predicates";
import {
  createIngredientSerializer,
  type IngredientSerializer,
} from "./serializer/ingredients";
import {
  createResultSerializer,
  type ResultSerializer,
} from "./serializer/results";

export default defineModule<{
  services: {
    "serializer:results": ResultSerializer;
    "serializer:ingredients": IngredientSerializer;
    predicates: Predicates;
  };
}>({
  importModule: name,
  dependencies: {
    // TODO could be optional somehow
    "@adeficior/data-modifier-tags": "required",
  },
  types: {
    services: {
      "serializer:results": "ResultSerializer",
      "serializer:ingredients": "IngredientSerializer",
      predicates: "Predicates",
    },
  },
  setup: (pack) => {
    const ingredientSerializer = pack.service(
      "serializer:ingredients",
      (container) =>
        createIngredientSerializer(
          pack.options.packFormat,
          container.get("registries"),
        ),
    );

    pack.service("serializer:results", (container) =>
      createResultSerializer(
        pack.options.packFormat,
        container.get("registries"),
      ),
    );

    // TODO make tags optional
    // TODO split in predicates:ingredients, predicates:results, predicates:id?
    pack.service("predicates", (container) =>
      createPredicates(
        container.get("registries"),
        container.get("loader:tags"),
        ingredientSerializer(),
      ),
    );
  },
});
