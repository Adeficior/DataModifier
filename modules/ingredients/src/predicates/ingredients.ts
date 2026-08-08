import {
  IllegalShapeError,
  type NormalizedId,
  type RegistryLookup,
} from "@adeficior/data-modifier-core";
import {
  createIdPredicate,
  type CommonFilter,
  type Predicate,
} from "@adeficior/data-modifier-core/serializer";
import { type TagRegistryHolder } from "@adeficior/data-modifier-tags";
import { type RegistryId } from "@adeficior/data-modifier/generated";
import {
  Ingredient,
  ItemIngredient,
  ItemTagIngredient,
  ListIngredient,
  RegistryEntryIngredient,
  TagIngredient,
} from "../ingredient/impl";
import { type IngredientInput } from "../ingredient/input";
import { type IngredientSerializer } from "../serializer/ingredients";

export type IngredientFilter =
  CommonFilter<Ingredient> | IngredientInput | `#${string}`;

type Context = {
  registries: RegistryLookup;
  serializer: IngredientSerializer;
  tags: TagRegistryHolder;
};

export function createIngredientPredicate(
  test: IngredientFilter,
  context: Context,
): Predicate<Ingredient> {
  const unvalidated = createUnvalidatedFilter(test, context);
  return (it) => unvalidated(context.serializer.validated(it));
}

function createUnvalidatedFilter(
  test: IngredientFilter,
  context: Context,
): Predicate<Ingredient> {
  if (typeof test === "string") {
    if (test.startsWith("#")) {
      return createUnvalidatedFilter(
        new ItemTagIngredient(test.substring(1)),
        context,
      );
    }

    return createUnvalidatedFilter(new ItemIngredient(test), context);
  }

  if (test instanceof RegExp) {
    return filterByRegistry(test, context.tags, "minecraft:item");
  }

  if (typeof test === "function") {
    return test;
  }

  if (test instanceof Ingredient) {
    test.validate(context.registries);
  }

  if (test instanceof TagIngredient) {
    return filterByRegistry(test.tag, context.tags, test.registry);
  }

  if (test instanceof RegistryEntryIngredient) {
    return filterByRegistry(test.id, context.tags, test.registry);
  }

  if (test instanceof ListIngredient) {
    const predicates = test.entries.map((it) =>
      createUnvalidatedFilter(it, context),
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
