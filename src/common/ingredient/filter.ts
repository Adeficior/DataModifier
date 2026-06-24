import type { RegistryId } from "@adeficior/data-modifier/generated";
import {
  BlockIngredient,
  BlockTagIngredient,
  FluidIngredient,
  FluidTagIngredient,
  Ingredient,
  ItemIngredient,
  ItemTagIngredient,
} from ".";
import { tryCatching } from "../../error";
import type { PackContext } from "../../loader/context";
import type { TagRegistryHolder } from "../../loader/tags";
import {
  createCommonFilter,
  type CommonFilter,
  type Predicate,
} from "../filters";
import { encodeId, type NormalizedId } from "../id";
import type { IngredientInput } from "./input";

export type IngredientFilter =
  | CommonFilter<Ingredient>
  | IngredientInput
  | `#${string}`;

export default function createIngredientFilter(
  test: IngredientFilter,
  context: Omit<PackContext, "results">,
): Predicate<IngredientInput> {
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
    return filterByRegistry(test, context.tags, "minecraft:item");
  }

  if (typeof test === "function") {
    return (it, logger) => test(context.ingredients.create(it), logger);
  }

  if (test instanceof Ingredient) {
    test.validate(context.lookup);
  }

  if (test instanceof ItemTagIngredient) {
    return filterByRegistry(test.tag, context.tags, "minecraft:item");
  }

  if (test instanceof ItemIngredient) {
    return filterByRegistry(test.id, context.tags, "minecraft:item");
  }

  if (test instanceof FluidTagIngredient) {
    return filterByRegistry(test.tag, context.tags, "minecraft:fluid");
  }

  if (test instanceof FluidIngredient) {
    return filterByRegistry(test.id, context.tags, "minecraft:fluid");
  }

  if (test instanceof BlockTagIngredient) {
    return filterByRegistry(test.tag, context.tags, "minecraft:block");
  }

  if (test instanceof BlockIngredient) {
    return filterByRegistry(test.id, context.tags, "minecraft:block");
  }
  // TODO add support for ListIngredient?

  // TODO warn or throw?
  return () => false;
}

function filterByRegistry(
  test: NormalizedId | RegExp,
  tags: TagRegistryHolder,
  registry: NormalizedId<RegistryId>,
): Predicate<IngredientInput> {
  function resolveIds(it: IngredientInput): NormalizedId[] {
    if (typeof it === "string") return [encodeId(it)];
    if (Array.isArray(it)) {
      return it.flatMap(resolveIds);
    }

    return it.idsFor(registry);
  }

  return createCommonFilter<IngredientInput, NormalizedId>(
    test,
    (input, logger) =>
      // TODO which exception has to be caught here?
      tryCatching(logger, () => {
        return resolveIds(input);
      }) ?? [],
    tags.registry(registry),
  );
}
