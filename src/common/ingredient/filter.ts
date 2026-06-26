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

// TODO is createPredicate
export default function createIngredientFilter(
  test: IngredientFilter,
  context: Pick<PackContext, "ingredients" | "tags" | "lookup">,
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
    return filterByRegistry(test, context, "minecraft:item");
  }

  if (typeof test === "function") {
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
  // TODO add support for ListIngredient?

  // TODO warn or throw?
  return () => false;
}

function filterByRegistry(
  test: NormalizedId | RegExp,
  context: Pick<PackContext, "ingredients" | "tags" | "lookup">,
  registry: NormalizedId<RegistryId>,
): Predicate<IngredientInput> {
  function resolveIds(it: IngredientInput): NormalizedId[] {
    const ingredient = context.ingredients.create(it);
    return ingredient.idsFor(registry);
  }

  // TODO create Ingredient Filter and transform to input filter
  return createCommonFilter<IngredientInput, NormalizedId>(
    test,
    // TODO remove logger
    (input, _logger) => resolveIds(input),
    context.tags.registry(registry),
  );
}
