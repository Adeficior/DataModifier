import {
  packFormatOf,
  type LoaderContext,
} from "@adeficior/data-modifier-core";
import { createTestLogger } from "@adeficior/pack-resolver/testing";
import { createTestDataResolver, setupLookup } from "@adeficior/testing";
import { beforeAll, expect, it } from "bun:test";
import { basename } from "node:path";
import { createIngredientSerializer } from "../../../../core/src/serializer/ingredients";
import { createResultSerializer } from "../../../../core/src/serializer/results";
import { RecipeLoader } from "../../src/loader";

const version = basename(import.meta.dir);
const context: LoaderContext = { logger: createTestLogger() };
const lookup = setupLookup(version);
// TODO is dirty depending on core impl, move this test as an "integration" test to lib instead?
const results = createResultSerializer(packFormatOf(version), lookup);
const ingredients = createIngredientSerializer(packFormatOf(version), lookup);
const loader = new RecipeLoader(results, ingredients);

beforeAll(async () => {
  const resolver = await createTestDataResolver(version, {
    include: ["data/*/tags/**/*.json", "data/*/recipes/**/*.json"],
  });
  await resolver.extract(loader);
});

it("has no unknown recipe loaders", () => {
  expect(loader.unknownRecipeTypes().map((it) => it.type)).toBeEmpty();
});

it("does not encounter any errors", () => {
  expect(context.logger.trace).not.toHaveBeenCalled();
  expect(context.logger.warn).not.toHaveBeenCalled();
  expect(context.logger.error).not.toHaveBeenCalled();
});
