import { packFormatOf } from "@adeficior/data-modifier-core";
import type { RegistryLookup } from "@adeficior/data-modifier-core";
import type { TagRegistryHolder } from "@adeficior/data-modifier-tags";
import { createPredicates } from "../predicates";
import type { Predicates } from "../predicates";
import { createIngredientSerializer } from "../serializer/ingredients";
import type { IngredientSerializer } from "../serializer/ingredients";
import { createResultSerializer } from "../serializer/results";
import type { ResultSerializer } from "../serializer/results";

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
