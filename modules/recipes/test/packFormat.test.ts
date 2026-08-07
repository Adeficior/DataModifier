import {
  packFormatOf,
  type LoaderContext,
} from "@adeficior/data-modifier-core";
import {
  createTestAcceptor,
  createTestLogger,
} from "@adeficior/pack-resolver/testing";
import {
  mockIngredientSerializer,
  mockPredicates,
  mockRegistryProvider,
  mockResultSerializer,
} from "@adeficior/testing";
import { describe, expect, it } from "bun:test";
import { EMPTY_RECIPE } from "../src";
import { RecipeEmitter } from "../src/emitter";
import { RecipeLoader } from "../src/loader";

const version = "1.21.1";
// TODO common method?
const context: LoaderContext = { logger: createTestLogger() };
const serializer = new RecipeLoader(
  mockResultSerializer(),
  mockIngredientSerializer(),
);
const emitter = new RecipeEmitter(
  context.logger,
  packFormatOf(version),
  mockRegistryProvider(),
  mockResultSerializer(),
  mockIngredientSerializer(),
  mockPredicates(),
  serializer,
);

describe("loader respects different pack format versions", () => {
  it("folders follow new syntax after 1.21", async () => {
    const acceptor = createTestAcceptor();

    emitter.add("example:test", EMPTY_RECIPE);
    // TODO move to loot test
    // loader.loot.add("example:test", EMPTY_LOOT_TABLE);

    await emitter.resolver(context).extract(acceptor);

    // expect(acceptor.jsonAt("data/example/loot_table/test.json")).toMatchObject(
    //   EMPTY_LOOT_TABLE,
    // );
    expect(acceptor.jsonAt("data/example/recipe/test.json")).toMatchObject(
      EMPTY_RECIPE,
    );

    expect(acceptor.jsonAt("data/example/loot_tables/test.json")).toBeNull();
    expect(acceptor.jsonAt("data/example/recipes/test.json")).toBeNull();
  });
});
