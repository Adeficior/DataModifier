import { createTestAcceptor } from "@adeficior/pack-resolver/testing";
import { describe, expect, it } from "bun:test";
import { basename } from "node:path";
import {
  ItemIngredient,
  ItemTagIngredient,
} from "../../src/common/ingredient/index.js";
import { ItemResult } from "../../src/common/result/index.js";
import type { RecipeTest } from "../../src/emit/data/recipe.js";
import { EMPTY_RECIPE } from "../../src/emit/data/recipe.js";
import type { NormalizedId } from "../../src/index.js";
import type { ShapedRecipeDefinition } from "../../src/parser/index.js";
import setupLoader from "../shared/loaderSetup.js";

const version = basename(import.meta.dir);
const { logger, loader } = setupLoader({
  version,
  include: ["data/**/*.json"],
});

it("has no unknown recipe loaders", () => {
  expect(loader.recipeLoader.unknownRecipeTypes()).toBeEmpty();
});

it("does not encounter any errors", () => {
  expect(logger.trace).not.toHaveBeenCalled();
  expect(logger.warn).not.toHaveBeenCalled();
  expect(logger.error).not.toHaveBeenCalled();
});

describe("recipe ingredient replacement", () => {
  it("replaces ingredients", async () => {
    const acceptor = createTestAcceptor();

    loader.recipes.replaceIngredient(
      "minecraft:redstone",
      new ItemIngredient("minecraft:emerald"),
    );

    await loader.emit(acceptor);

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

    loader.recipes.replaceIngredient(
      "minecraft:redstone",
      new ItemIngredient("minecraft:emerald"),
      {
        input: "#minecraft:planks",
      },
    );

    await loader.emit(acceptor);

    expect(acceptor.paths().length).toBe(2);

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

    loader.recipes.replaceIngredient(
      "#forge:raw_materials/zinc",
      new ItemTagIngredient("forge:raw_materials/iron"),
    );

    await loader.emit(acceptor);

    expect(acceptor.paths().length).toBe(4);

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

    loader.recipes.remove({
      input: new ItemIngredient("biomesoplenty:violet"),
      type: "farmersdelight:cutting",
    });

    await loader.emit(acceptor);

    expect(
      acceptor.jsonAt("data/custom/recipes/conditional.json"),
    ).toMatchObject(EMPTY_RECIPE);
  });
});

describe("recipe removal", () => {
  it("removes recipes with id filter", async () => {
    const acceptor = createTestAcceptor();

    loader.recipes.remove({
      id: /minecraft:.*piston/,
    });

    await loader.emit(acceptor);

    expect(acceptor.paths().length).toBe(2);

    expect(acceptor.jsonAt("data/minecraft/recipes/piston.json")).toMatchObject(
      EMPTY_RECIPE,
    );
    expect(
      acceptor.jsonAt("data/minecraft/recipes/sticky_piston.json"),
    ).toMatchObject(EMPTY_RECIPE);
  });

  it("removes recipes with type filter", async () => {
    const acceptor = createTestAcceptor();

    loader.recipes.remove({
      type: "minecraft:smelting",
    });

    await loader.emit(acceptor);

    expect(acceptor.paths().length).toBe(118);
  });

  it("removes recipes with result filter", async () => {
    const acceptor = createTestAcceptor();

    loader.recipes.remove({
      output: "minecraft:cooked_beef",
    });

    await loader.emit(acceptor);

    expect(acceptor.paths().length).toBe(3);

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

  loader.recipes.add("example:custom", recipe);

  await loader.emit(acceptor);

  expect(acceptor.jsonAt("data/example/recipes/custom.json")).toMatchObject(
    recipe,
  );
});

it("warns about duplicate custom recipe IDs", () => {
  const id: NormalizedId = "example:recipe";

  loader.recipes.add(id, { type: "example:something" });
  loader.recipes.add(id, { type: "example:something_else" });

  expect(logger.error).toHaveBeenCalledWith(
    `Overwriting custom recipe with ID ${id}`,
  );
});

it("warns about missing recipe removal matches", async () => {
  const test: RecipeTest = {
    type: "example:not_existing",
  };

  loader.recipes.remove(test);

  await loader.emit(createTestAcceptor());

  expect(logger.trace).toHaveBeenCalledWith(
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
  loader.recipes.replaceResult(from, to);

  await loader.emit(createTestAcceptor());

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
  const from = "minecraft:nothing";
  const to = new ItemResult("minecraft:dirt");
  loader.recipes.replaceResult(from, to, { optional: true });

  await loader.emit(createTestAcceptor());

  expect(logger.error).not.toHaveBeenCalled();
});
