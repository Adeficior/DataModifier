import type { RegistryId } from "@adeficior/data-modifier/generated";
import { IllegalShapeError } from "../../common/error";
import type { NormalizedId } from "../../common/id";
import type { Container } from "../../container";
import {
  createIdPredicate,
  type CommonFilter,
  type Predicate,
} from "../filters";
import {
  Ingredient,
  ItemIngredient,
  ItemTagIngredient,
  ListIngredient,
  RegistryEntryIngredient,
  TagIngredient,
} from "./impl";
import type { IngredientInput } from "./input";

export type IngredientFilter =
  CommonFilter<Ingredient> | IngredientInput | `#${string}`;

export function createIngredientPredicate(
  test: IngredientFilter,
  container: Container,
): Predicate<Ingredient> {
  const ingredients = container.get("serializer:ingredients");
  const unvalidated = createUnvalidatedFilter(test, container);
  return (it) => unvalidated(ingredients.validated(it));
}

function createUnvalidatedFilter(
  test: IngredientFilter,
  container: Container,
): Predicate<Ingredient> {
  if (typeof test === "string") {
    if (test.startsWith("#")) {
      return createIngredientPredicate(
        new ItemTagIngredient(test.substring(1)),
        container,
      );
    }

    return createIngredientPredicate(new ItemIngredient(test), container);
  }

  if (test instanceof RegExp) {
    return filterByRegistry(test, container, "minecraft:item");
  }

  if (typeof test === "function") {
    const ingredients = container.get("serializer:ingredients");
    return (it) => test(ingredients.deserialize(it));
  }

  if (test instanceof Ingredient) {
    const lookup = container.get("registries");
    test.validate(lookup);
  }

  if (test instanceof TagIngredient) {
    return filterByRegistry(test.tag, container, test.registry);
  }

  if (test instanceof RegistryEntryIngredient) {
    return filterByRegistry(test.id, container, test.registry);
  }

  if (test instanceof ListIngredient) {
    const predicates = test.entries.map((it) =>
      createIngredientPredicate(it, container),
    );
    return (it) => predicates.some((predicate) => predicate(it));
  }

  throw new IllegalShapeError("cannot filter by unknown ingredient type", test);
}

function filterByRegistry(
  test: NormalizedId | RegExp,
  tags: TagRegistryHolder,
  registry: NormalizedId<RegistryId>,
): Predicate<Ingredient> {
  return createIdPredicate<Ingredient, NormalizedId>(
    test,
    (it) => it.ids()[registry] ?? [],
    tags.registry(registry),
  );
}
