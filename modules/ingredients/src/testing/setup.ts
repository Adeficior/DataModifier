import {
  packFormatOf,
  type RegistryLookup,
} from "@adeficior/data-modifier-core";
import { type TagRegistryHolder } from "@adeficior/data-modifier-tags";
import { createPredicates, type Predicates } from "../predicates";
import {
  createIngredientSerializer,
  type IngredientSerializer,
} from "../serializer/ingredients";
import {
  createResultSerializer,
  type ResultSerializer,
} from "../serializer/results";

export function setupIngredientSerializer(
  version: string,
  registries: RegistryLookup,
): IngredientSerializer {
  return createIngredientSerializer(packFormatOf(version), registries);
}

export function setupResultSerializer(
  version: string,
  registries: RegistryLookup,
): ResultSerializer {
  return createResultSerializer(packFormatOf(version), registries);
}

export function setupPredicates(
  registries: RegistryLookup,
  tags: TagRegistryHolder,
  ingredients: IngredientSerializer,
): Predicates {
  return createPredicates(registries, tags, ingredients);
}
