import { beforeAll, describe, expect, it } from "bun:test";
import { basename } from "node:path";
import { packFormatOf, UnknownRegistryEntry } from "../../src";
import { ItemIngredient } from "../../src/common/ingredient";
import createIngredientPredicate from "../../src/common/ingredient/filter";
import IngredientSerializer from "../../src/common/ingredient/serializer";
import TagsLoader from "../../src/loader/tags";
import setupLookup from "../shared/dump";
import {
  invalidIngredientFilters,
  matchingIngredientFilters,
  missingIngredientFilters,
} from "../shared/provider/1.20.1/ingredientFilters";
import { provided } from "../shared/provider/providers";
import { createTestDataResolver } from "../shared/testData";

const version = basename(import.meta.dir);
const lookup = setupLookup(version);
const data = createTestDataResolver(version, {
  include: ["data/*/tags/**/*.json"],
});

const ingredients = new IngredientSerializer(packFormatOf(version), lookup);
const tags = new TagsLoader(packFormatOf(version));
const context = { ingredients, lookup, tags };

beforeAll(async () => data.extract(tags));

describe(`ingredient filter tests with ${version} format`, () => {
  provided("matching filters", matchingIngredientFilters(), (filter, input) => {
    const predicate = createIngredientPredicate(filter, context);
    const actual = predicate(input);
    expect(actual).toBeTrue();
  });

  provided("missing filters", missingIngredientFilters(), (filter, input) => {
    const predicate = createIngredientPredicate(filter, context);
    const actual = predicate(input);
    expect(actual).toBeFalse();
  });

  provided(
    "invalid filters",
    invalidIngredientFilters(),
    (filter, expected) => {
      expect(() => createIngredientPredicate(filter, context)).toThrow(
        expected,
      );
    },
  );

  it("invalid test subject", () => {
    const filter = new ItemIngredient("minecraft:apple");
    const predicate = createIngredientPredicate(filter, context);
    expect(() =>
      predicate(new ItemIngredient("minecraft:horse_radish")),
    ).toThrow(UnknownRegistryEntry);
  });
});
