import { packFormatOf } from "@adeficior/data-modifier-core";
import type { EventHandler } from "@adeficior/data-modifier-core";
import {
  setupIngredientSerializer,
  setupPredicates,
  setupResultSerializer,
} from "@adeficior/data-modifier-ingredients/testing";
import { setupTagRegistry } from "@adeficior/data-modifier-tags/testing";
import { createTestLogger } from "@adeficior/pack-resolver/testing";
import { createTestDataResolver, setupLookup } from "@adeficior/testing";
import { afterAll, afterEach, beforeAll } from "bun:test";
import { RecipeEmitter } from "../emitter";
import type { RegisterRecipeParser } from "../hooks";
import { RecipeLoader } from "../loader";
import { recipePattern } from "../schema";

// TODO move to testing package?
export function setupRecipeLoader(
  version: string,
  parsers?: EventHandler<RegisterRecipeParser>,
  mods: string[] = [],
) {
  const lookup = setupLookup(version);

  const results = setupResultSerializer(version, lookup);
  const ingredients = setupIngredientSerializer(version, lookup);

  const loader = new RecipeLoader(results, ingredients, {
    mods: ["minecraft", ...mods],
  });
  const logger = createTestLogger();

  beforeAll(async () => {
    await parsers?.({
      register: (...args) => loader.registerParser(...args),
    });

    const resolver = await createTestDataResolver(version, {
      include: recipePattern(packFormatOf(version)),
      logger,
    });
    //  TODO use distribute for this somehow
    await resolver.extract(loader);
  });

  afterAll(() => {
    logger.reset();
  });

  return { loader, logger };
}

export function setupRecipeEmitter(
  version: string,
  parsers?: EventHandler<RegisterRecipeParser>,
  mods: string[] = ["minecraft"],
) {
  const lookup = setupLookup(version);

  const results = setupResultSerializer(version, lookup);
  const ingredients = setupIngredientSerializer(version, lookup);
  const tags = setupTagRegistry(version);
  const predicates = setupPredicates(lookup, tags, ingredients);

  const logger = createTestLogger();
  const { loader } = setupRecipeLoader(version, parsers, mods);

  const emitter = new RecipeEmitter(
    logger,
    packFormatOf(version),
    loader,
    results,
    ingredients,
    predicates,
    loader,
  );

  const resolver = emitter.resolver({ logger });

  afterEach(() => {
    emitter.clear();
    logger.reset();
  });

  return { loader, emitter, resolver, logger };
}
