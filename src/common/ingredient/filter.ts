import type { RegistryId } from "@adeficior/data-modifier/generated";
import { exists } from "@adeficior/pack-resolver";
import type { Ingredient } from ".";
import {
  BlockIngredient,
  BlockTagIngredient,
  FluidIngredient,
  FluidTagIngredient,
  ItemIngredient,
  ItemTagIngredient,
} from ".";
import { tryCatching } from "../../error";
import type { PackContext } from "../../loader/context";
import type { TagRegistry } from "../../loader/tags";
import {
  encodeId,
  type IdInput,
  type NormalizedId,
  type TagInput,
} from "../id";
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
        new ItemTagIngredient(test as TagInput),
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
      extractItemID,
    );
  }

  if (test instanceof FluidIngredient) {
    return resolveIdTest(
      encodeId(test.id),
      context.tags.registry("fluid"),
      extractItemID,
    );
  }

  if (test instanceof BlockTagIngredient) {
    return resolveIdTest(
      `#${encodeId(test.tag)}`,
      context.tags.registry("block"),
      extractItemID,
    );
  }

  if (test instanceof BlockIngredient) {
    return resolveIdTest(
      encodeId(test.id),
      context.tags.registry("block"),
      extractItemID,
    );
  }

  // TODO warn or throw?
  return () => false;
}

function resolveIdTest(
  test: NormalizedId | RegExp,
  tags: TagRegistry<RegistryId>,
  idSupplier: (it: Ingredient) => IdInput | null,
): Predicate<IngredientInput> {
  function resolveIds(it: IngredientInput): IdInput[] {
    if (typeof it === "string") return [it];
    if (Array.isArray(it)) {
      return it.flatMap(resolveIds);
    } else {
      return [idSupplier(it)].filter(exists);
    }
  }

  return resolveCommonTest<IngredientInput, NormalizedId>(
    test,
    (input, logger) =>
      tryCatching(logger, () => {
        return resolveIds(input).map(encodeId);
      }) ?? [],
    tags,
  );
}

function extractItemID(ingredient: Ingredient): IdInput | null {
  if (ingredient instanceof ItemTagIngredient) {
    return ingredient.tag;
  }

  if (ingredient instanceof ItemIngredient) {
    return ingredient.id;
  }

  return null;
}
