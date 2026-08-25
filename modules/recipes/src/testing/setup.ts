import type {
  EventHandler,
  RegistryLookup,
} from "@adeficior/data-modifier-core";
import { packFormatOf } from "@adeficior/data-modifier-core";
import {
  setupIngredientSerializer,
  setupPredicates,
  setupResultSerializer,
} from "@adeficior/data-modifier-ingredients/testing";
import { setupTagRegistry } from "@adeficior/data-modifier-tags/testing";
import { createTestLogger } from "@adeficior/pack-resolver/testing";
import type { TestDataOptions } from "@adeficior/testing";
import { createTestDataResolver, setupLookup } from "@adeficior/testing";
import { afterAll, afterEach, beforeAll } from "bun:test";
import type { RecipeEmitter } from "../emitter";
import { RecipeEmitterImpl } from "../emitter";
import type { RegisterRecipeSerializer } from "../hooks";
import type { RecipeLoader } from "../loader";
import { RecipeLoaderImpl } from "../loader";
import { recipeFolder, recipePattern } from "../schema";
import type { RecipesSerializer } from "../serializer";
import { registerDefaultSerializers } from "../serializer/default";
import { RecipeSerializerImpl } from "../serializer/impl";

export type TestRecipeSerializerOptions = {
  parsers?: EventHandler<RegisterRecipeSerializer>;
};

export function setupRecipeSerializer(
  version: string,
  options?: TestRecipeSerializerOptions,
) {
  const lookup = setupLookup(version);
  const results = setupResultSerializer(version, lookup);
  const ingredients = setupIngredientSerializer(version, lookup);
  const serializer = new RecipeSerializerImpl(results, ingredients);

  beforeAll(async () => {
    registerDefaultSerializers(serializer.createEvent());
    await options?.parsers?.(serializer.createEvent());
  });

  return { lookup, serializer: serializer as RecipesSerializer };
}

export type TestRecipeLoaderOptions = TestDataOptions &
  TestRecipeSerializerOptions & {
    mods?: string[];
  };

export function setupRecipeLoader(
  version: string,
  { mods = [], parsers, ...resolverOptions }: TestRecipeLoaderOptions = {},
) {
  const { lookup, serializer } = setupRecipeSerializer(version, { parsers });

  const loader = new RecipeLoaderImpl(
    serializer,
    recipeFolder(packFormatOf(version)),
    {
      mods: ["minecraft", ...mods],
    },
  );
  const logger = createTestLogger();

  beforeAll(async () => {
    const resolver = await createTestDataResolver(version, {
      include: recipePattern(packFormatOf(version)),
      logger,
      ...resolverOptions,
    });
    await resolver.extract(loader);
  });

  afterAll(() => {
    logger.reset();
  });

  return {
    logger,
    serializer,
    lookup: lookup as RegistryLookup,
    loader: loader as RecipeLoader,
  };
}

export function setupRecipeEmitter(
  version: string,
  options?: TestRecipeLoaderOptions,
) {
  const { loader, serializer, lookup } = setupRecipeLoader(version, options);
  const results = setupResultSerializer(version, lookup);
  const ingredients = setupIngredientSerializer(version, lookup);
  const tags = setupTagRegistry(version, options);
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

  return { loader, resolver, logger, emitter: emitter as RecipeEmitter };
}

export function recipeModuleOptions(
  mod: string,
  parsers: TestRecipeLoaderOptions["parsers"],
): TestRecipeLoaderOptions {
  return {
    parsers,
    from: ["default", mod],
    mods: [mod],
  };
}
