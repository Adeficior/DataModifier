import {
  packFormatOf,
  type LoaderContext,
} from "@adeficior/data-modifier-core";
import {
  createTestAcceptor,
  createTestLogger,
} from "@adeficior/pack-resolver/testing";
import {
  mockPredicates,
  mockRegistryLookup,
  mockRegistryProvider,
} from "@adeficior/testing";
import { describe, expect, it } from "bun:test";
import { EMPTY_LOOT_TABLE, LootTableEmitter } from "../../src/emitter";

const version = "1.21.1";
// TODO common method?
const context: LoaderContext = { logger: createTestLogger() };
const emitter = new LootTableEmitter(
  packFormatOf(version),
  mockRegistryProvider(),
  mockRegistryLookup(),
  mockPredicates(),
);

describe("loader respects different pack format versions", () => {
  it("folders follow new syntax after 1.21", async () => {
    const acceptor = createTestAcceptor();

    emitter.add("example:test", EMPTY_LOOT_TABLE);

    await emitter.resolver(context).extract(acceptor);

    expect(acceptor.jsonAt("data/example/loot_table/test.json")).toMatchObject(
      EMPTY_LOOT_TABLE,
    );

    expect(acceptor.jsonAt("data/example/loot_tables/test.json")).toBeNull();
    expect(acceptor.jsonAt("data/example/recipes/test.json")).toBeNull();
  });
});
