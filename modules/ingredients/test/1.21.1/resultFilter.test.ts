import {
  packFormatOf,
  UnknownRegistryEntry,
} from "@adeficior/data-modifier-core";
import { setupTagRegistry } from "@adeficior/data-modifier-tags/testing";
import { provided, setupLookup } from "@adeficior/testing";
import { describe, expect, it } from "bun:test";
import { basename } from "node:path";
import { ItemIngredient, ItemResult } from "../../src";
import { createPredicates } from "../../src/predicates";
import { createIngredientSerializer } from "../../src/serializer/ingredients";
import {
  invalidResultFilters,
  matchingResultFilters,
  missingResultFilters,
} from "../util/providers/1.21.1/resultFilters";

const version = basename(import.meta.dir);
const lookup = setupLookup(version);
const ingredients = createIngredientSerializer(packFormatOf(version), lookup);
const tags = setupTagRegistry(version);
const predicates = createPredicates(lookup, tags, ingredients);

describe(`result filter tests with ${version} format`, () => {
  provided("matching filters", matchingResultFilters(), (filter, input) => {
    const predicate = predicates.result(filter);
    const actual = predicate(input);
    expect(actual).toBeTrue();
  });

  provided("missing filters", missingResultFilters(), (filter, input) => {
    const predicate = predicates.result(filter);
    const actual = predicate(input);
    expect(actual).toBeFalse();
  });

  provided("invalid filters", invalidResultFilters(), (filter, expected) => {
    expect(() => predicates.result(filter)).toThrow(expected);
  });

  it("invalid test subject", () => {
    const filter = new ItemIngredient("minecraft:apple");
    const predicate = predicates.result(filter);
    expect(() => predicate(new ItemResult("minecraft:horse_radish"))).toThrow(
      UnknownRegistryEntry,
    );
  });
});
