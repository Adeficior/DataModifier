import { beforeAll, describe, expect, it } from "bun:test";
import { basename } from "node:path";
import { packFormatOf, UnknownRegistryEntry } from "../../src";
import { ItemIngredient } from "../../src/common/ingredient";
import IngredientSerializer from "../../src/common/ingredient/serializer";
import { ItemResult } from "../../src/common/result";
import createResultPredicate from "../../src/common/result/filter";
import TagsLoader from "../../src/loader/tags";
import setupLookup from "../shared/dump";
import {
  invalidResultFilters,
  matchingResultFilters,
  missingResultFilters,
} from "../shared/provider/1.20.1/resultFilters";
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

beforeAll(() => data.extract(tags));

describe(`result filter tests with ${version} format`, () => {
  provided("matching filters", matchingResultFilters(), (filter, input) => {
    const predicate = createResultPredicate(filter, context);
    const actual = predicate(input);
    expect(actual).toBeTrue();
  });

  provided("missing filters", missingResultFilters(), (filter, input) => {
    const predicate = createResultPredicate(filter, context);
    const actual = predicate(input);
    expect(actual).toBeFalse();
  });

  provided("invalid filters", invalidResultFilters(), (filter, expected) => {
    expect(() => createResultPredicate(filter, context)).toThrow(expected);
  });

  it("invalid test subject", () => {
    const filter = new ItemIngredient("minecraft:apple");
    const predicate = createResultPredicate(filter, context);
    expect(() => predicate(new ItemResult("minecraft:horse_radish"))).toThrow(
      UnknownRegistryEntry,
    );
  });
});
