import { createTestLogger } from "@adeficior/pack-resolver/testing";
import { beforeAll, describe, expect, it } from "bun:test";
import { packFormatOf, UnknownRegistryEntry } from "../../src";
import { ItemIngredient } from "../../src/common/ingredient";
import IngredientSerializer from "../../src/common/ingredient/serializer";
import { ItemResult } from "../../src/common/result";
import createResultPredicate from "../../src/common/result/filter";
import RegistryDumpLoader from "../../src/loader/registry/dump";
import TagsLoader from "../../src/loader/tags";
import {
  invalidResultFilters,
  matchingResultFilters,
  missingResultFilters,
} from "../shared/provider/1.20.1/resultFilters";
import { provided } from "../shared/provider/providers";
import { createDumpResolver, createTestDataResolver } from "../shared/testData";

const logger = createTestLogger();
const version = "1.20.1";

// TODO create helpers
const lookup = new RegistryDumpLoader(logger);
const data = createTestDataResolver(version, {
  include: ["data/*/tags/**/*.json"],
});

const ingredients = new IngredientSerializer(packFormatOf(version), lookup);
const tags = new TagsLoader(lookup);
const context = { ingredients, lookup, tags };

beforeAll(async () => {
  await lookup.extract(createDumpResolver(version));
  await data.extract(tags.accept);
});

describe("result filter tests with 1.20.1 format", () => {
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
