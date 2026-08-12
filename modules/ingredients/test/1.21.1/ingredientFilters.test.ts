import {
  packFormatOf,
  UnknownRegistryEntry,
} from "@adeficior/data-modifier-core";
import { setupTagRegistry } from "@adeficior/data-modifier-tags/testing";
import { provided, setupLookup } from "@adeficior/testing";
import { describe, expect, it } from "bun:test";
import { basename } from "node:path";
import { ItemIngredient } from "../../src";
import { createPredicates } from "../../src/predicates";
import { createIngredientSerializer } from "../../src/serializer/ingredients";
import {
  invalidIngredientFilters,
  matchingIngredientFilters,
  missingIngredientFilters,
} from "../util/providers/1.21.1/ingredientFilters";

const version = basename(import.meta.dir);
const lookup = setupLookup(version);

const ingredients = createIngredientSerializer(packFormatOf(version), lookup);
const tags = setupTagRegistry(version);
const predicates = createPredicates(lookup, tags, ingredients);

describe(`ingredient filter tests with ${version} format`, () => {
  provided("matching filters", matchingIngredientFilters(), (filter, input) => {
    const predicate = predicates.ingredient(filter);
    const actual = predicate(input);
    expect(actual).toBeTrue();
  });

  provided("missing filters", missingIngredientFilters(), (filter, input) => {
    const predicate = predicates.ingredient(filter);
    const actual = predicate(input);
    expect(actual).toBeFalse();
  });

  provided(
    "invalid filters",
    invalidIngredientFilters(),
    (filter, expected) => {
      expect(() => predicates.ingredient(filter)).toThrow(expected);
    },
  );

  it("invalid test subject", () => {
    const filter = new ItemIngredient("minecraft:apple");
    const predicate = predicates.ingredient(filter);
    expect(() =>
      predicate(new ItemIngredient("minecraft:horse_radish")),
    ).toThrow(UnknownRegistryEntry);
  });
});
