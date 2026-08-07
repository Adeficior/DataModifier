import {
  type LoaderContext,
  type NormalizedId,
  ItemIngredient,
  ItemResult,
  ItemTagIngredient,
  packFormatOf,
} from "@adeficior/data-modifier-core";
import {
  createTestAcceptor,
  createTestLogger,
} from "@adeficior/pack-resolver/testing";
import {
  createTestDataResolver,
  setupLookup,
  setupTagRegistry,
} from "@adeficior/testing";
import { beforeAll, describe, expect, it } from "bun:test";
import { basename } from "node:path";
import { PredicatesImpl } from "../../../../core/src/predicates";
import { createIngredientSerializer } from "../../../../core/src/serializer/ingredients";
import { createResultSerializer } from "../../../../core/src/serializer/results";
import {
  type RecipeTest,
  type ShapedRecipeDefinition,
  EMPTY_RECIPE,
} from "../../src";
import { RecipeEmitter } from "../../src/emitter";
import { RecipeLoader } from "../../src/loader";

const version = basename(import.meta.dir);
const context: LoaderContext = { logger: createTestLogger() };
const lookup = setupLookup(version);

// TODO is dirty depending on core impl, move this test as an "integration" test to lib instead?
const results = createResultSerializer(packFormatOf(version), lookup);
const ingredients = createIngredientSerializer(packFormatOf(version), lookup);
const tags = setupTagRegistry(version);
const predicates = new PredicatesImpl(lookup, tags, ingredients);

const loader = new RecipeLoader(results, ingredients);
const emitter = new RecipeEmitter(
  context.logger,
  packFormatOf(version),
  loader,
  results,
  ingredients,
  predicates,
  loader,
);

beforeAll(async () => {
  const resolver = await createTestDataResolver(version, {
    include: ["data/*/tags/**/*.json", "data/*/recipes/**/*.json"],
  });
  await resolver.extract(loader);
});

describe("recipe ingredient replacement", () => {
  it("replaces ingredients", async () => {
    const acceptor = createTestAcceptor();

    emitter.replaceIngredient(
      "minecraft:redstone",
      new ItemIngredient("minecraft:emerald"),
    );

    await emitter.resolver(context).extract(acceptor);

    expect(
      acceptor.jsonAt("data/minecraft/recipes/piston.json"),
    ).toMatchSnapshot("modified piston recipe");
    expect(
      acceptor.jsonAt("data/minecraft/recipes/compass.json"),
    ).toMatchSnapshot("modified compass recipe");

    expect(acceptor.paths()).toMatchSnapshot(
      "recipes including redstone as an ingredient",
    );
  });

  it("replaces ingredients with additional input filter", async () => {
    const acceptor = createTestAcceptor();

    emitter.replaceIngredient(
      "minecraft:redstone",
      new ItemIngredient("minecraft:emerald"),
      {
        input: "#minecraft:planks",
      },
    );

    await emitter.resolver(context).extract(acceptor);

    expect(
      acceptor.jsonAt("data/minecraft/recipes/piston.json"),
    ).toMatchSnapshot("modified piston recipe");
    expect(
      acceptor.jsonAt("data/minecraft/recipes/note_block.json"),
    ).toMatchSnapshot("modified note_block recipe");
    expect(acceptor.jsonAt("data/minecraft/recipes/compass.json")).toBeNull();
  });

  it("replaces ingredients in create recipes", async () => {
    const acceptor = createTestAcceptor();

    emitter.replaceIngredient(
      "#forge:raw_materials/zinc",
      new ItemTagIngredient("forge:raw_materials/iron"),
    );

    await emitter.resolver(context).extract(acceptor);

    expect(
      acceptor.jsonAt(
        "data/create/recipes/crafting/materials/raw_zinc_block.json",
      ),
    ).toMatchSnapshot("modified create:raw_zinc_block recipe");
    expect(
      acceptor.jsonAt("data/create/recipes/crushing/raw_zinc.json"),
    ).toMatchSnapshot("modified create:raw_zinc recipe");
    expect(
      acceptor.jsonAt(
        "data/create/recipes/blasting/zinc_ingot_from_raw_ore.json",
      ),
    ).toMatchSnapshot("modified create:zinc_ingot_from_raw_ore recipe");
    expect(
      acceptor.jsonAt(
        "data/create/recipes/smelting/zinc_ingot_from_raw_ore.json",
      ),
    ).toMatchSnapshot("modified create:zinc_ingot_from_raw_ore recipe");
  });

  it("matches recipes wrapped in forge:conditional", async () => {
    const acceptor = createTestAcceptor();

    emitter.remove({
      input: new ItemIngredient("biomesoplenty:violet"),
      type: "farmersdelight:cutting",
    });

    await emitter.resolver(context).extract(acceptor);

    expect(
      acceptor.jsonAt("data/custom/recipes/conditional.json"),
    ).toMatchObject(EMPTY_RECIPE);
  });
});

describe("recipe removal", () => {
  it("removes recipes with id filter", async () => {
    const acceptor = createTestAcceptor();

    emitter.remove({
      id: /minecraft:.*piston/,
    });

    await emitter.resolver(context).extract(acceptor);

    expect(acceptor.paths()).toHaveLength(3);

    expect(acceptor.jsonAt("data/minecraft/recipes/piston.json")).toMatchObject(
      EMPTY_RECIPE,
    );
    expect(
      acceptor.jsonAt("data/minecraft/recipes/sticky_piston.json"),
    ).toMatchObject(EMPTY_RECIPE);
  });

  it("removes recipes with type filter", async () => {
    const acceptor = createTestAcceptor();

    emitter.remove({
      type: "minecraft:smelting",
    });

    await emitter.resolver(context).extract(acceptor);

    expect(acceptor.paths()).toHaveLength(119);
  });

  it("removes recipes with result filter", async () => {
    const acceptor = createTestAcceptor();

    emitter.remove({
      output: "minecraft:cooked_beef",
    });

    await emitter.resolver(context).extract(acceptor);

    expect(acceptor.paths()).toHaveLength(4);

    expect(
      acceptor.jsonAt("data/minecraft/recipes/cooked_beef.json"),
    ).toMatchObject(EMPTY_RECIPE);
    expect(
      acceptor.jsonAt("data/minecraft/recipes/cooked_beef_from_smoking.json"),
    ).toMatchObject(EMPTY_RECIPE);
    expect(
      acceptor.jsonAt(
        "data/minecraft/recipes/cooked_beef_from_campfire_cooking.json",
      ),
    ).toMatchObject(EMPTY_RECIPE);
  });
});

it("creates custom recipes", async () => {
  const acceptor = createTestAcceptor();

  const recipe: ShapedRecipeDefinition = {
    type: "minecraft:shaped",
    key: {
      A: {
        item: "minecraft:diamond",
      },
      B: {
        tag: "minecraft:iron_ores",
      },
    },
    result: {
      item: "minecraft:command_block",
    },
    pattern: ["A ", " B"],
  };

  emitter.add("example:custom", recipe);

  await emitter.resolver(context).extract(acceptor);

  expect(acceptor.jsonAt("data/example/recipes/custom.json")).toMatchObject(
    recipe,
  );
});

it("warns about duplicate custom recipe IDs", () => {
  const id: NormalizedId = "example:recipe";

  emitter.add(id, { type: "example:something" });
  emitter.add(id, { type: "example:something_else" });

  expect(context.logger.error).toHaveBeenCalledWith(
    `Overwriting custom recipe with ID ${id}`,
  );
});

it("warns about missing recipe removal matches", async () => {
  const test: RecipeTest = {
    type: "example:not_existing",
  };

  emitter.remove(test);

  const acceptor = createTestAcceptor();
  await emitter.resolver(context).extract(acceptor);

  expect(context.logger.trace).toHaveBeenCalledWith(
    "could not find any recipes matching",
    expect.objectContaining({
      operation: "remove",
      test,
    }),
  );
});

it("warns about missing recipe replacement matches", async () => {
  const from = "minecraft:nothing";
  const to = new ItemResult("minecraft:dirt");
  emitter.replaceResult(from, to);

  const acceptor = createTestAcceptor();
  await emitter.resolver(context).extract(acceptor);

  expect(context.logger.trace).toHaveBeenCalledWith(
    "could not find any recipes matching",
    expect.objectContaining({
      operation: "replace result",
      from,
      to,
    }),
  );
});

it("does not warn about optional missing recipe matches", async () => {
  const from = "minecraft:nothing";
  const to = new ItemResult("minecraft:dirt");
  emitter.replaceResult(from, to, { optional: true });

  const acceptor = createTestAcceptor();
  await emitter.resolver(context).extract(acceptor);

  expect(context.logger.error).not.toHaveBeenCalled();
});
