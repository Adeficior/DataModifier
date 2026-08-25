import type { LoaderContext } from "@adeficior/data-modifier-core";
import { packFormatOf } from "@adeficior/data-modifier-core";
import { mockRegistryProvider } from "@adeficior/data-modifier-core/testing";
import {
  mockIngredientSerializer,
  mockPredicates,
  mockResultSerializer,
} from "@adeficior/data-modifier-ingredients/testing";
import {
  createTestAcceptor,
  createTestLogger,
} from "@adeficior/pack-resolver/testing";
import { describe, expect, it } from "bun:test";
import { EMPTY_RECIPE } from "../../src";
import { RecipeEmitterImpl } from "../../src/emitter";
import { RecipeSerializerImpl } from "../../src/serializer/impl";
import { mockRules } from "../../src/testing";

const version = "1.21.1";
// TODO common method?
const context: LoaderContext = { logger: createTestLogger() };
const serializer = new RecipeSerializerImpl(
  mockResultSerializer(),
  mockIngredientSerializer(),
);
const emitter = new RecipeEmitterImpl(
  context.logger,
  packFormatOf(version),
  mockRegistryProvider(),
  mockResultSerializer(),
  mockIngredientSerializer(),
  mockPredicates(),
  mockRules(),
  serializer,
);

describe("loader respects different pack format versions", () => {
  it("folders follow new syntax after 1.21", async () => {
    const acceptor = createTestAcceptor();

    emitter.add("example:test", EMPTY_RECIPE);

    await emitter.resolver(context).extract(acceptor);

    expect(acceptor.jsonAt("data/example/recipe/test.json")).toMatchObject(
      EMPTY_RECIPE,
    );

    expect(acceptor.jsonAt("data/example/loot_tables/test.json")).toBeNull();
    expect(acceptor.jsonAt("data/example/recipes/test.json")).toBeNull();
  });
});
