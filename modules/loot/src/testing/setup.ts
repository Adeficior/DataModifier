import { packFormatOf } from "@adeficior/data-modifier-core";
import { setupTagRegistry } from "@adeficior/data-modifier-tags/testing";
import { createTestLogger } from "@adeficior/pack-resolver/testing";
import { createTestDataResolver, setupLookup } from "@adeficior/testing";
import { afterAll, afterEach, beforeAll } from "bun:test";
import { createPredicates } from "../../../ingredients/src/predicates";
import { createIngredientSerializer } from "../../../ingredients/src/serializer/ingredients";
import { LootTableEmitter } from "../emitter";
import { lootTablePattern } from "../helper";
import { LootTableLoader } from "../loader";

export function setupLootLoader(
  version: string,
  mods: string[] = ["minecraft"],
) {
  const loader = new LootTableLoader({ mods });
  const logger = createTestLogger();

  beforeAll(async () => {
    const resolver = await createTestDataResolver(version, {
      include: lootTablePattern(packFormatOf(version)),
      logger,
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
  mods: string[] = ["minecraft"],
) {
  const lookup = setupLookup(version);
  const { loader } = setupLootLoader(version, mods);

  const ingredients = createIngredientSerializer(packFormatOf(version), lookup);
  const tags = setupTagRegistry(version);
  const predicates = createPredicates(lookup, tags, ingredients);

  const emitter = new LootTableEmitter(
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
