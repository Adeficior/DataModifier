import { packFormatOf, type EventHandler } from "@adeficior/data-modifier-core";
import { createTestLogger } from "@adeficior/pack-resolver/testing";
import {
  createTestDataResolver,
  setupLookup,
  setupTagRegistry,
} from "@adeficior/testing";
import { afterAll, afterEach, beforeAll } from "bun:test";
import { createPredicates } from "../../../ingredients/src/predicates";
import { createIngredientSerializer } from "../../../ingredients/src/serializer/ingredients";
import { createResultSerializer } from "../../../ingredients/src/serializer/results";
import { recipePattern, type RegisterRecipeParser } from "../../src";
import { RecipeEmitter } from "../../src/emitter";
import { RecipeLoader } from "../../src/loader";

export function setupRecipeLoader(
  version: string,
  parsers?: EventHandler<RegisterRecipeParser>,
  mods: string[] = ["minecraft"],
) {
  const lookup = setupLookup(version);

  // TODO is dirty depending on core impl, move this test as an "integration" test to lib instead?
  const results = createResultSerializer(packFormatOf(version), lookup);
  const ingredients = createIngredientSerializer(packFormatOf(version), lookup);

  const loader = new RecipeLoader(results, ingredients, { mods });
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

export function setupRecipeEmitter(version: string) {
  const lookup = setupLookup(version);

  // TODO is dirty depending on core impl, move this test as an "integration" test to lib instead?
  const results = createResultSerializer(packFormatOf(version), lookup);
  const ingredients = createIngredientSerializer(packFormatOf(version), lookup);
  const tags = setupTagRegistry(version);
  const predicates = createPredicates(lookup, tags, ingredients);

  const logger = createTestLogger();
  const { loader } = setupRecipeLoader(version);

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
