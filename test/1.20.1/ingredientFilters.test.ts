import { createTestLogger } from "@adeficior/pack-resolver/testing";
import { beforeAll, describe, expect } from "bun:test";
import { packFormatOf } from "../../src";
import createIngredientFilter from "../../src/common/ingredient/filter";
import IngredientSerializer from "../../src/common/ingredient/serializer";
import RegistryDumpLoader from "../../src/loader/registry/dump";
import TagsLoader from "../../src/loader/tags";
import {
  matchingIngredientFilters,
  missingIngredientFilters,
} from "../shared/provider/1.20.1/ingredientFilters";
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

describe("ingredient filter tests with 1.20.1 format", () => {
  provided("matching filters", matchingIngredientFilters(), (filter, input) => {
    const predicate = createIngredientFilter(filter, context);
    const actual = predicate(input);
    expect(actual).toBeTrue();
  });

  provided("missing filters", missingIngredientFilters(), (filter, input) => {
    const predicate = createIngredientFilter(filter, context);
    const actual = predicate(input);
    expect(actual).toBeFalse();
  });
});
