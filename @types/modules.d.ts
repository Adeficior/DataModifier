import type {
  IngredientSerializer,
  Predicates,
  RegistryLookup,
  RegistryProvider,
  ResultSerializer,
  TagRegistryHolder,
} from "../core/src";
import type { LangDefinition } from "../modules/lang/src";

declare module "@adeficior/data-modifier-core/generated" {
  export type Services = {
    registries: RegistryLookup;
    "serializer:ingredients": IngredientSerializer;
    "serializer:results": ResultSerializer;
    predicates: Predicates;
    "loader:tags": TagRegistryHolder;
    "loader:lang": RegistryProvider<LangDefinition>;
  };
}
