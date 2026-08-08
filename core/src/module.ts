import { name } from "../package.json";
import { defineModule } from "./modules/define";
import { PredicatesImpl, type Predicates } from "./predicates";
import { EmptyRegistryLookup } from "./registry/empty";
import { type RegistryLookup } from "./registry/lookup";
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
    registries: RegistryLookup;
  };
}>({
  importModule: name,
  types: {
    services: {
      "serializer:results": "ResultSerializer",
      "serializer:ingredients": "IngredientSerializer",
      predicates: "Predicates",
      registries: "RegistryLookup",
    },
  },
  setup: (pack) => {
    // TODO overwrite with dump somehow?
    const registries = pack.service(
      "registries",
      () => new EmptyRegistryLookup(),
    );

    const ingredientSerializer = pack.service("serializer:ingredients", () =>
      createIngredientSerializer(pack.options.packFormat, registries()),
    );

    pack.service("serializer:results", () =>
      createResultSerializer(pack.options.packFormat, registries()),
    );

    // TODO make tags optional
    pack.service(
      "predicates",
      (container) =>
        new PredicatesImpl(
          registries(),
          // TODO somehow I depend on tags which does not make sense because tags depends on core
          // solved if moved to ingredients package?
          container.get("loader:tags"),
          ingredientSerializer(),
        ),
    );
  },
});
