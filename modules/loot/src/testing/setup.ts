import { packFormatOf } from "@adeficior/data-modifier-core";
import {
  setupIngredientSerializer,
  setupPredicates,
} from "@adeficior/data-modifier-ingredients/testing";
import { setupTagRegistry } from "@adeficior/data-modifier-tags/testing";
import { createTestLogger } from "@adeficior/pack-resolver/testing";
import type { TestDataOptions } from "@adeficior/testing";
import { createTestDataResolver, setupLookup } from "@adeficior/testing";
import { afterAll, afterEach, beforeAll } from "bun:test";
import { LootEmitterImpl } from "../emitter";
import { lootTablePattern } from "../helper";
import { LootTableLoader } from "../loader";

export type TestLootLoaderOptions = TestDataOptions & {
  mods?: string[];
};

export function setupLootLoader(
  version: string,
  { mods = [], ...resolverOptions }: TestLootLoaderOptions = {},
) {
  const loader = new LootTableLoader({ mods: ["minecraft", ...mods] });
  const logger = createTestLogger();

  beforeAll(async () => {
    const resolver = await createTestDataResolver(version, {
      include: lootTablePattern(packFormatOf(version)),
      logger,
      ...resolverOptions,
    });
    await resolver.extract(loader);
  });

  afterAll(() => {
    logger.reset();
  });

  return { loader, logger };
}

export function setupLootEmitter(
  version: string,
  options?: TestLootLoaderOptions,
) {
  const lookup = setupLookup(version);
  const { loader } = setupLootLoader(version, options);

  const tags = setupTagRegistry(version, options);
  const predicates = setupPredicates(
    lookup,
    tags,
    setupIngredientSerializer(version, lookup),
  );

  const emitter = new LootEmitterImpl(
    packFormatOf(version),
    loader,
    lookup,
    predicates,
  );

  const logger = createTestLogger();
  const resolver = emitter.resolver({ logger });

  afterEach(() => {
    emitter.clear();
    logger.reset();
  });

  return { loader, emitter, resolver, logger };
}
