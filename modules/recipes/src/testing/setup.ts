import type { EventHandler } from "@adeficior/data-modifier-core";
import { packFormatOf } from "@adeficior/data-modifier-core";
import {
  setupIngredientSerializer,
  setupPredicates,
  setupResultSerializer,
} from "@adeficior/data-modifier-ingredients/testing";
import { setupTagRegistry } from "@adeficior/data-modifier-tags/testing";
import { createTestLogger } from "@adeficior/pack-resolver/testing";
import { createTestDataResolver, setupLookup } from "@adeficior/testing";
import { afterAll, afterEach, beforeAll } from "bun:test";
import { RecipeEmitterImpl } from "../emitter";
import type { RegisterRecipeSerializer } from "../hooks";
import { RecipeLoaderImpl } from "../loader";
import { recipePattern } from "../schema";
import { registerDefaultSerializers } from "../serializer/default";
import { RecipeSerializerImpl } from "../serializer/impl";

export function setupRecipeSerializer(
  version: string,
  parsers?: EventHandler<RegisterRecipeSerializer>,
) {
  const lookup = setupLookup(version);
  const results = setupResultSerializer(version, lookup);
  const ingredients = setupIngredientSerializer(version, lookup);
  const serializer = new RecipeSerializerImpl(results, ingredients);

  beforeAll(async () => {
    registerDefaultSerializers(serializer.createEvent());
    await parsers?.(serializer.createEvent());
  });

  return { lookup, serializer };
}

export function setupRecipeLoader(
  version: string,
  parsers?: EventHandler<RegisterRecipeSerializer>,
  mods: string[] = [],
) {
  const { lookup, serializer } = setupRecipeSerializer(version, parsers);

  const loader = new RecipeLoaderImpl(serializer, {
    mods: ["minecraft", ...mods],
  });
  const logger = createTestLogger();

  beforeAll(async () => {
    const resolver = await createTestDataResolver(version, {
      include: recipePattern(packFormatOf(version)),
      logger,
    });
    await resolver.extract(loader);
  });

  afterAll(() => {
    logger.reset();
  });

  return { loader, logger, serializer, lookup };
}

export function setupRecipeEmitter(
  version: string,
  parsers?: EventHandler<RegisterRecipeSerializer>,
  mods: string[] = ["minecraft"],
) {
  const { loader, serializer, lookup } = setupRecipeLoader(
    version,
    parsers,
    mods,
  );
  const results = setupResultSerializer(version, lookup);
  const ingredients = setupIngredientSerializer(version, lookup);
  const tags = setupTagRegistry(version);
  const predicates = setupPredicates(lookup, tags, ingredients);

  const logger = createTestLogger();

  const emitter = new RecipeEmitterImpl(
    logger,
    packFormatOf(version),
    loader,
    results,
    ingredients,
    predicates,
    serializer,
  );

  const resolver = emitter.resolver({ logger });

  afterEach(() => {
    emitter.clear();
    logger.reset();
  });

  return { loader, emitter, resolver, logger };
}
