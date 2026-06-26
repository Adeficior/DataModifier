import type { RegistryId } from "@adeficior/data-modifier/generated";
import {
  BlockIngredient,
  BlockTagIngredient,
  FluidIngredient,
  FluidTagIngredient,
  Ingredient,
  ItemIngredient,
  ItemTagIngredient,
  ListIngredient,
} from ".";
import type { PackContext } from "../../loader/context";
import {
  createCommonFilter,
  type CommonFilter,
  type Predicate,
} from "../filters";
import { type NormalizedId } from "../id";
import type { IngredientInput } from "./input";

export type IngredientFilter =
  | CommonFilter<Ingredient>
  | IngredientInput
  | `#${string}`;

export default function createIngredientFilter(
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
      return createIngredientFilter(
        new ItemTagIngredient(test.substring(1)),
        context,
      );
    }

    return createIngredientFilter(new ItemIngredient(test), context);
  }

  if (test instanceof RegExp) {
    return filterByRegistry(test, context, "minecraft:item");
  }

  if (typeof test === "function") {
    // ingredients.create not needed if function wrapped
    return (it, logger) => test(context.ingredients.create(it), logger);
  }

  if (test instanceof Ingredient) {
    test.validate(context.lookup);
  }

  if (test instanceof ItemTagIngredient) {
    return filterByRegistry(test.tag, context, "minecraft:item");
  }

  if (test instanceof ItemIngredient) {
    return filterByRegistry(test.id, context, "minecraft:item");
  }

  if (test instanceof FluidTagIngredient) {
    return filterByRegistry(test.tag, context, "minecraft:fluid");
  }

  if (test instanceof FluidIngredient) {
    return filterByRegistry(test.id, context, "minecraft:fluid");
  }

  if (test instanceof BlockTagIngredient) {
    return filterByRegistry(test.tag, context, "minecraft:block");
  }

  if (test instanceof BlockIngredient) {
    return filterByRegistry(test.id, context, "minecraft:block");
  }

  if (test instanceof ListIngredient) {
    const predicates = test.entries.map((it) =>
      createIngredientFilter(it, context),
    );
    return (it) => predicates.some((predicate) => predicate(it));
  }

  // TODO warn or throw?
  return () => false;
}

function filterByRegistry(
  test: NormalizedId | RegExp,
  context: Pick<PackContext, "ingredients" | "tags" | "lookup">,
  registry: NormalizedId<RegistryId>,
): Predicate<Ingredient> {
  return createCommonFilter<Ingredient, NormalizedId>(
    test,
    // TODO remove logger
    (it, _logger) => it.idsFor(registry),
    context.tags.registry(registry),
  );
}
