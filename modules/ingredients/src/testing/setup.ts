import type { RegistryLookup } from "@adeficior/data-modifier-core";
import { packFormatOf } from "@adeficior/data-modifier-core";
import type { TagRegistries } from "@adeficior/data-modifier-tags";
import type { Predicates } from "../predicates";
import { createPredicates } from "../predicates";
import type { IngredientSerializer } from "../serializer/ingredients";
import { createIngredientSerializer } from "../serializer/ingredients";
import type { ResultSerializer } from "../serializer/results";
import { createResultSerializer } from "../serializer/results";

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
  tags: TagRegistries,
  ingredients: IngredientSerializer,
): Predicates {
  return createPredicates(registries, tags, ingredients);
}
