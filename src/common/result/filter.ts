import type { RegistryId } from "@adeficior/data-modifier/generated";
import type { Result } from ".";
import { BlockResult, FluidResult, ItemResult } from ".";
import { tryCatching } from "../../error";
import type { PackContext } from "../../loader/context";
import type { TagRegistry } from "../../loader/tags";
import {
  createCommonFilter,
  type CommonFilter,
  type Predicate,
} from "../filters";
import { encodeId, type NormalizedId } from "../id";
import type { ResultInput } from "./input";

export type ResultFilter = CommonFilter<Result> | ResultInput;

export default function createResultFilter(
  test: ResultFilter,
  context: Omit<PackContext, "ingredients">,
): Predicate<ResultInput> {
  if (typeof test === "string") {
    return createResultFilter(new ItemResult(test), context);
  }

  if (test instanceof RegExp) {
    return filterByResultId(
      test,
      context.tags.registry("minecraft:item"),
      (it) => it.idsFor("minecraft:item"),
    );
  }

  if (typeof test === "function") {
    return (it, logger) => test(context.results.create(it), logger);
  }

  if (test instanceof ItemResult) {
    return filterByResultId(
      test.id,
      context.tags.registry("minecraft:item"),
      (it) => it.idsFor("minecraft:item"),
    );
  }

  if (test instanceof FluidResult) {
    return filterByResultId(
      test.id,
      context.tags.registry("minecraft:fluid"),
      (it) => it.idsFor("minecraft:fluid"),
    );
  }

  // TODO match method in ingredient itself?
  if (test instanceof BlockResult) {
    return filterByResultId(
      test.id,
      context.tags.registry("minecraft:block"),
      (it) => it.idsFor("minecraft:block"),
    );
  }

  // TODO warn or throw?
  return () => false;
}

function filterByResultId(
  test: NormalizedId | RegExp,
  tags: TagRegistry<RegistryId>,
  idSupplier: (it: Result) => NormalizedId[],
): Predicate<ResultInput> {
  function resolveIds(it: ResultInput): NormalizedId[] {
    if (typeof it === "string") return [encodeId(it)];
    if (Array.isArray(it)) {
      return it.flatMap(resolveIds);
    } else {
      return idSupplier(it);
    }
  }

  return createCommonFilter<ResultInput, NormalizedId>(
    test,
    (input, logger) =>
      // TODO which exception has to be caught here?
      tryCatching(logger, () => {
        return resolveIds(input);
      }) ?? [],
    tags,
  );
}
