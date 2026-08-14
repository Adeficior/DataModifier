import { type NormalizedId } from "@adeficior/data-modifier-core";
import {
  ItemIngredient,
  ItemResult,
} from "@adeficior/data-modifier-ingredients";
import { createTestAcceptor } from "@adeficior/pack-resolver/testing";
import { describe, expect, it } from "bun:test";
import { basename } from "node:path";
import {
  type RecipeTest,
  type ShapedRecipeDefinition,
  EMPTY_RECIPE,
} from "../../src";
import { setupRecipeEmitter } from "../../src/testing";

const version = basename(import.meta.dir);
const { emitter, resolver, logger } = setupRecipeEmitter(version);

describe("recipe ingredient replacement", () => {
  it("replaces ingredients", async () => {
    const acceptor = createTestAcceptor();

    emitter.replaceIngredient(
      "minecraft:redstone",
      new ItemIngredient("minecraft:emerald"),
    );

    await resolver.extract(acceptor);

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

    await resolver.extract(acceptor);

    expect(
      acceptor.jsonAt("data/minecraft/recipes/piston.json"),
    ).toMatchSnapshot("modified piston recipe");
    expect(
      acceptor.jsonAt("data/minecraft/recipes/note_block.json"),
    ).toMatchSnapshot("modified note_block recipe");
    expect(acceptor.jsonAt("data/minecraft/recipes/compass.json")).toBeNull();
  });

  it("matches recipes wrapped in forge:conditional", async () => {
    const acceptor = createTestAcceptor();

    emitter.remove({
      input: new ItemIngredient("minecraft:poppy"),
      type: "minecraft:crafting_shapeless",
    });

    await resolver.extract(acceptor);

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

    await resolver.extract(acceptor);

    expect(acceptor.paths()).toHaveLength(2);

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

    await resolver.extract(acceptor);

    expect(acceptor.paths()).toHaveLength(70);
  });

  it("removes recipes with result filter", async () => {
    const acceptor = createTestAcceptor();

    emitter.remove({
      output: "minecraft:cooked_beef",
    });

    await resolver.extract(acceptor);

    expect(acceptor.paths()).toHaveLength(3);

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

  await resolver.extract(acceptor);

  expect(acceptor.jsonAt("data/example/recipes/custom.json")).toMatchObject(
    recipe,
  );
});

it("warns about duplicate custom recipe IDs", () => {
  const id: NormalizedId = "example:recipe";

  emitter.add(id, { type: "example:something" });
  emitter.add(id, { type: "example:something_else" });

  expect(logger.error).toHaveBeenCalledWith(
    `Overwriting custom recipe with ID ${id}`,
  );
});

it("warns about missing recipe removal matches", async () => {
  const test: RecipeTest = {
    type: "example:not_existing",
  };

  emitter.remove(test);

  const acceptor = createTestAcceptor();
  await resolver.extract(acceptor);

  expect(logger.trace).toHaveBeenCalledWith(
    "could not find any recipes matching",
    expect.objectContaining({
      operation: "remove",
      test,
    }),
  );
});

it("warns about missing recipe replacement matches", async () => {
  const from = "minecraft:bedrock";
  const to = new ItemResult("minecraft:dirt");
  emitter.replaceResult(from, to);

  const acceptor = createTestAcceptor();
  await resolver.extract(acceptor);

  expect(logger.trace).toHaveBeenCalledWith(
    "could not find any recipes matching",
    expect.objectContaining({
      operation: "replace result",
      from,
      to,
    }),
  );
});

it("does not warn about optional missing recipe matches", async () => {
  const from = "minecraft:bedrock";
  const to = new ItemResult("minecraft:dirt");
  emitter.replaceResult(from, to, { optional: true });

  const acceptor = createTestAcceptor();
  await resolver.extract(acceptor);

  expect(logger.error).not.toHaveBeenCalled();
});
