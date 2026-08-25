import type { LoaderContext } from "@adeficior/data-modifier-core";
import { packFormatOf } from "@adeficior/data-modifier-core";
import {
  mockRegistry,
  mockRegistryLookup,
} from "@adeficior/data-modifier-core/testing";
import { mockPredicates } from "@adeficior/data-modifier-ingredients/testing";
import {
  createTestAcceptor,
  createTestLogger,
} from "@adeficior/pack-resolver/testing";
import { describe, expect, it } from "bun:test";
import { basename } from "node:path";
import { EMPTY_LOOT_TABLE, LootEmitterImpl } from "../../src/emitter";
import { mockRules } from "../../src/testing";

const version = basename(import.meta.dir);
// TODO common method?
const context: LoaderContext = { logger: createTestLogger() };
const emitter = new LootEmitterImpl(
  packFormatOf(version),
  mockRegistry(),
  context.logger,
  mockRegistryLookup(),
  mockPredicates(),
  mockRules(),
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
