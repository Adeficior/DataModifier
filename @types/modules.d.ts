import type { RegistryLookup } from "../core/src";

declare module "@adeficior/data-modifier-core/generated" {
  export type Services = {
    registries: RegistryLookup;
    "serializer:ingredients": IngredientSerializer;
    "serializer:results": ResultSerializer;
  };
}
