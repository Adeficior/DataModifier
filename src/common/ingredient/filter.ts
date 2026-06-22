import type { RegistryId } from "@adeficior/data-modifier/generated";
import { exists } from "@adeficior/pack-resolver";
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
import { tryCatching } from "../../error";
import type { PackContext } from "../../loader/context";
import type { TagRegistry } from "../../loader/tags";
import { createId, encodeId, type IdInput, type NormalizedId } from "../id";
import {
  resolveCommonTest,
  type CommonTest,
  type Predicate,
} from "../predicates";
import type { IngredientInput } from "./input";

export type IngredientTest =
  | CommonTest<Ingredient>
  | IngredientInput
  | `#${string}`;

export default function resolveIngredientTest(
  test: IngredientTest,
  // TODO pass context?
  context: Omit<PackContext, "results">,
): Predicate<IngredientInput> {
  if (typeof test === "string") {
    if (test.startsWith("#")) {
      return resolveIngredientTest(
        new ItemTagIngredient(test.substring(1)),
        context,
      );
    }

    return resolveIngredientTest(new ItemIngredient(test), context);
  }

  if (test instanceof RegExp) {
    return resolveIdTest(test, context.tags.registry("item"), extractItemID);
  }

  if (typeof test === "function") {
    return (it, logger) => test(context.ingredients.create(it), logger);
  }

  if (test instanceof Ingredient) {
    test.validate(context.lookup);
  }

  if (test instanceof ItemTagIngredient) {
    return resolveIdTest(
      `#${encodeId(test.tag)}`,
      context.tags.registry("item"),
      extractItemID,
    );
  }

  if (test instanceof ItemIngredient) {
    return resolveIdTest(
      encodeId(test.id),
      context.tags.registry("item"),
      extractItemID,
    );
  }

  if (test instanceof FluidTagIngredient) {
    return resolveIdTest(
      `#${encodeId(test.tag)}`,
      context.tags.registry("fluid"),
      extractFluidID,
    );
  }

  if (test instanceof FluidIngredient) {
    return resolveIdTest(
      encodeId(test.id),
      context.tags.registry("fluid"),
      extractFluidID,
    );
  }

  if (test instanceof BlockTagIngredient) {
    return resolveIdTest(
      `#${encodeId(test.tag)}`,
      context.tags.registry("block"),
      extractBlockID,
    );
  }

  // TODO match method in ingredient itself?
  if (test instanceof BlockIngredient) {
    return resolveIdTest(
      encodeId(test.id),
      context.tags.registry("block"),
      extractBlockID,
    );
  }

  // TODO add support for ListIngredient?

  // TODO warn or throw?
  return () => false;
}

// TODO is Predicate<Ingredient> fine?
function resolveIdTest(
  test: NormalizedId | RegExp,
  tags: TagRegistry<RegistryId>,
  idSupplier: (it: Ingredient) => IdInput | null,
): Predicate<IngredientInput> {
  function resolveIds(it: IngredientInput): IdInput[] {
    if (typeof it === "string") return [it];
    if (it instanceof ListIngredient) {
      return it.entries.flatMap(resolveIds);
    } else if (Array.isArray(it)) {
      return it.flatMap(resolveIds);
    } else {
      return [idSupplier(it)].filter(exists);
    }
  }

  return resolveCommonTest<IngredientInput, NormalizedId>(
    test,
    (input, logger) =>
      // TODO which exception has to be caught here?
      tryCatching(logger, () => {
        return resolveIds(input).map(encodeId);
      }) ?? [],
    tags,
  );
}

function extractItemID(ingredient: Ingredient): IdInput | null {
  if (ingredient instanceof ItemTagIngredient) {
    return { ...createId(ingredient.tag), isTag: true };
  }

  if (ingredient instanceof ItemIngredient) {
    return ingredient.id;
  }

  return null;
}

// TODO functions on the ingredient itself?
// TODO common super class maybe even?
function extractBlockID(ingredient: Ingredient): IdInput | null {
  if (ingredient instanceof BlockTagIngredient) {
    return { ...createId(ingredient.tag), isTag: true };
  }

  if (ingredient instanceof BlockIngredient) {
    return ingredient.id;
  }

  return null;
}

function extractFluidID(ingredient: Ingredient): IdInput | null {
  if (ingredient instanceof FluidTagIngredient) {
    return { ...createId(ingredient.tag), isTag: true };
  }

  if (ingredient instanceof FluidIngredient) {
    return ingredient.id;
  }

  return null;
}
