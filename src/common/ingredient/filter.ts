import type { RegistryId } from "@adeficior/data-modifier/generated";
import {
  Ingredient,
  ItemIngredient,
  ItemTagIngredient,
  ListIngredient,
  RegistryEntryIngredient,
  TagIngredient,
} from ".";
import { IllegalShapeError } from "../../error";
import type { PackContext } from "../../loader/context";
import {
  createIdPredicate,
  type CommonFilter,
  type Predicate,
} from "../filters";
import { type NormalizedId } from "../id";
import type { IngredientInput } from "./input";

export type IngredientFilter =
  | CommonFilter<Ingredient>
  | IngredientInput
  | `#${string}`;

export default function createIngredientPredicate(
  test: IngredientFilter,
  context: Pick<PackContext, "ingredients" | "tags" | "lookup">,
): Predicate<Ingredient> {
  const unvalidated = createUnvalidatedFilter(test, context);
  return (it) => unvalidated(context.ingredients.validated(it));
}

function createUnvalidatedFilter(
  test: IngredientFilter,
  context: Pick<PackContext, "ingredients" | "tags" | "lookup">,
): Predicate<Ingredient> {
  if (typeof test === "string") {
    if (test.startsWith("#")) {
      return createIngredientPredicate(
        new ItemTagIngredient(test.substring(1)),
        context,
      );
    }

    return createIngredientPredicate(new ItemIngredient(test), context);
  }

  if (test instanceof RegExp) {
    return filterByRegistry(test, context, "minecraft:item");
  }

  if (typeof test === "function") {
    // TODO ingredients.create not needed if function wrapped
    return (it) => test(context.ingredients.create(it));
  }

  if (test instanceof Ingredient) {
    test.validate(context.lookup);
  }

  if (test instanceof TagIngredient) {
    return filterByRegistry(test.tag, context, test.registry);
  }

  if (test instanceof RegistryEntryIngredient) {
    return filterByRegistry(test.id, context, test.registry);
  }

  if (test instanceof ListIngredient) {
    const predicates = test.entries.map((it) =>
      createIngredientPredicate(it, context),
    );
    return (it) => predicates.some((predicate) => predicate(it));
  }

  throw new IllegalShapeError("cannot filter by unknown ingredient type", test);
}

function filterByRegistry(
  test: NormalizedId | RegExp,
  context: Pick<PackContext, "ingredients" | "tags" | "lookup">,
  registry: NormalizedId<RegistryId>,
): Predicate<Ingredient> {
  return createIdPredicate<Ingredient, NormalizedId>(
    test,
    (it) => it.idsFor(registry),
    context.tags.registry(registry),
  );
}
