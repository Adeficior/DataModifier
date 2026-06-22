import type { RegistryId } from "@adeficior/data-modifier/generated";
import { exists } from "@adeficior/pack-resolver";
import type { Result } from ".";
import { BlockResult, FluidResult, ItemResult } from ".";
import { tryCatching } from "../../error";
import type { PackContext } from "../../loader/context";
import type { TagRegistry } from "../../loader/tags";
import { encodeId, type IdInput, type NormalizedId } from "../id";
import {
  resolveCommonTest,
  type CommonTest,
  type Predicate,
} from "../predicates";
import type { ResultInput } from "./input";

export type ResultTest = CommonTest<Result> | ResultInput;

export default function resolveResultTest(
  test: ResultTest,
  // TODO pass context?
  context: Omit<PackContext, "ingredients">,
): Predicate<ResultInput> {
  if (typeof test === "string") {
    return resolveResultTest(new ItemResult(test), context);
  }

  if (test instanceof RegExp) {
    return resolveIdTest(test, context.tags.registry("item"), extractItemID);
  }

  if (typeof test === "function") {
    return (it, logger) => test(context.results.create(it), logger);
  }

  if (test instanceof ItemResult) {
    return resolveIdTest(
      encodeId(test.id),
      context.tags.registry("item"),
      extractItemID,
    );
  }

  if (test instanceof FluidResult) {
    return resolveIdTest(
      encodeId(test.id),
      context.tags.registry("fluid"),
      extractFluidID,
    );
  }

  // TODO match method in ingredient itself?
  if (test instanceof BlockResult) {
    return resolveIdTest(
      encodeId(test.id),
      context.tags.registry("block"),
      extractBlockID,
    );
  }

  // TODO warn or throw?
  return () => false;
}

function resolveIdTest(
  test: NormalizedId | RegExp,
  tags: TagRegistry<RegistryId>,
  idSupplier: (it: Result) => IdInput | null,
): Predicate<ResultInput> {
  function resolveIds(it: ResultInput): IdInput[] {
    if (typeof it === "string") return [it];
    if (Array.isArray(it)) {
      return it.flatMap(resolveIds);
    } else {
      return [idSupplier(it)].filter(exists);
    }
  }

  return resolveCommonTest<ResultInput, NormalizedId>(
    test,
    (input, logger) =>
      // TODO which exception has to be caught here?
      tryCatching(logger, () => {
        return resolveIds(input).map(encodeId);
      }) ?? [],
    tags,
  );
}

function extractItemID(ingredient: Result): IdInput | null {
  if (ingredient instanceof ItemResult) {
    return ingredient.id;
  }

  return null;
}

// TODO functions on the ingredient itself?
// TODO common super class maybe even?
function extractBlockID(ingredient: Result): IdInput | null {
  if (ingredient instanceof BlockResult) {
    return ingredient.id;
  }

  return null;
}

function extractFluidID(ingredient: Result): IdInput | null {
  if (ingredient instanceof FluidResult) {
    return ingredient.id;
  }

  return null;
}
