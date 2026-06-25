import { createTestAcceptor } from "@adeficior/pack-resolver/testing";
import { describe, expect, it } from "bun:test";
import {
  BlockIngredient,
  BlockTagIngredient,
  FluidIngredient,
  FluidTagIngredient,
  ItemIngredient,
  ItemTagIngredient,
} from "../src/common/ingredient/index.js";
import {
  BlockResult,
  FluidResult,
  ItemResult,
} from "../src/common/result/index.js";
import { tryCatching } from "../src/error.js";
import { encodeId } from "../src/index.js";
import setupLoader from "./shared/loaderSetup.js";

const version = "1.20.1";
const { logger, loader } = setupLoader({
  version,
  include: ["data/*/tags/**/*.json"],
});

// @ts-expect-error private
const { ingredients, results } = loader;

describe("tests regarding ingredient/result shapes", () => {
  // done
  it("warns about unknown ingredient shape", async () => {
    tryCatching(logger, () => ingredients.create(["test", { whatever: true }]));
    tryCatching(logger, () => ingredients.create({}));
    tryCatching(logger, () => ingredients.create(10));
    tryCatching(logger, () => ingredients.create(null));

    expect(logger.warn).toHaveBeenCalledTimes(4);
  });

  it("warns about unknown result shape", async () => {
    tryCatching(logger, () => results.create(["test", { whatever: true }]));
    tryCatching(logger, () => results.create({}));
    tryCatching(logger, () => results.create(10));
    tryCatching(logger, () => results.create(null));
    tryCatching(logger, () => results.create({ tag: "minecraft:pickaxes" }));
    tryCatching(logger, () => results.create({ fluidTag: "minecraft:fluid" }));
    tryCatching(logger, () => results.create({ blockTag: "minecraft:stone" }));

    expect(logger.warn).toHaveBeenCalledTimes(7);
  });

  // done
  it("warns about tags starting with a #", async () => {
    expect(() => ingredients.create({ tag: "#test" })).toThrow();
    expect(() => ingredients.create({ fluidTag: "#test" })).toThrow();
    expect(() => ingredients.create({ blockTag: "#test" })).toThrow();
  });

  it("does not encounter any unknown ingredient shapes", async () => {
    const acceptor = createTestAcceptor();

    loader.recipes.replaceIngredient(
      "minecraft:coal",
      new ItemIngredient("minecraft:diamond"),
    );
    loader.recipes.replaceIngredient(
      new ItemIngredient("minecraft:coal"),
      new ItemIngredient("minecraft:diamond"),
    );
    loader.recipes.replaceIngredient(
      new FluidIngredient("minecraft:water"),
      new ItemIngredient("minecraft:lava"),
    );
    loader.recipes.replaceIngredient(
      new BlockIngredient("minecraft:coal_block"),
      new ItemIngredient("minecraft:diamond_block"),
    );

    await loader.emit(acceptor);

    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("does not encounter any unknown result shapes", async () => {
    const acceptor = createTestAcceptor();

    loader.recipes.replaceResult(
      "minecraft:coal",
      new ItemResult("minecraft:diamond"),
    );
    loader.recipes.replaceResult(
      new ItemResult("minecraft:coal"),
      new ItemResult("minecraft:diamond"),
    );
    loader.recipes.replaceResult(
      new FluidResult("minecraft:water"),
      new ItemResult("minecraft:lava"),
    );
    loader.recipes.replaceResult(
      new BlockResult("minecraft:coal_block"),
      new ItemResult("minecraft:diamond_block"),
    );

    await loader.emit(acceptor);

    expect(logger.warn).not.toHaveBeenCalled();
  });
});

describe("ingredient tests applying to items", () => {
  it("matches ingredients using regex", () => {
    const predicate = loader.resolveIngredientTest(/.+:spruce_.+/);

    expect(predicate(new ItemIngredient("minecraft:spruce_log"))).toBeTrue();
    expect(predicate(new ItemIngredient("spruce_fence"))).toBeTrue();
    expect(predicate(new ItemIngredient("a-mod:spruce_something"))).toBeTrue();
    expect(
      predicate(new ItemTagIngredient("minecraft:spruce_wood")),
    ).toBeTrue();

    expect(
      predicate(new ItemIngredient("minecraft:stripped_spruce_log")),
    ).toBeFalse();
    expect(predicate(new ItemIngredient("something:else"))).toBeFalse();
    expect(
      predicate(new ItemTagIngredient("minecraft:stripped_spruce_wood")),
    ).toBeFalse();
  });

  it("matches ingredients using item id", () => {
    const predicate = loader.resolveIngredientTest("minecraft:obsidian");

    expect(predicate(new ItemIngredient("minecraft:obsidian"))).toBeTrue();

    expect(
      predicate(new ItemIngredient("minecraft:obsidian_pillar")),
    ).toBeFalse();
    expect(predicate(new ItemIngredient("example:obsidian"))).toBeFalse();
    expect(predicate(new ItemIngredient("minecraft:stone"))).toBeFalse();
    expect(predicate(new ItemTagIngredient("minecraft:obsidian"))).toBeFalse();
    expect(
      predicate(new ItemTagIngredient("minecraft:mineable/pickaxe")),
    ).toBeFalse();
  });

  it("matches ingredients using item tag", () => {
    const predicate = loader.resolveIngredientTest("#minecraft:logs");

    expect(predicate(new ItemIngredient("minecraft:oak_log"))).toBeTrue();
    expect(predicate(new ItemIngredient("stripped_birch_log"))).toBeTrue();
    expect(
      predicate(new ItemTagIngredient("minecraft:logs_that_burn")),
    ).toBeTrue();

    expect(predicate(new ItemIngredient("minecraft:stone"))).toBeFalse();
    expect(
      predicate(new ItemTagIngredient("minecraft:mineable/axe")),
    ).toBeFalse();
  });

  it("matches ingredients using item ingredient", () => {
    const predicate = loader.resolveIngredientTest(
      new ItemTagIngredient("minecraft:piglin_loved"),
    );

    expect(predicate(new ItemIngredient("minecraft:golden_sword"))).toBeTrue();
    expect(predicate(new ItemIngredient("golden_apple"))).toBeTrue();

    expect(predicate(new ItemIngredient("minecraft:ice"))).toBeFalse();
    expect(predicate(new ItemIngredient("blackstone"))).toBeFalse();
  });

  it("matches ingredients using tag ingredient", () => {
    const predicate = loader.resolveIngredientTest(
      new ItemIngredient("minecraft:mangrove_leaves"),
    );

    expect(
      predicate(new ItemIngredient("minecraft:mangrove_leaves")),
    ).toBeTrue();
    expect(predicate(new ItemIngredient("mangrove_leaves"))).toBeTrue();

    expect(
      predicate(new ItemIngredient("minecraft:mangrove_sapling")),
    ).toBeFalse();
  });
});

describe("ingredient tests applying to fluids", () => {
  it("matches fluid ingredients", () => {
    const predicate = loader.resolveIngredientTest(
      new FluidIngredient("minecraft:water"),
    );

    expect(predicate(new FluidIngredient("minecraft:water"))).toBeTrue();

    expect(predicate(new FluidIngredient("minecraft:lava"))).toBeFalse();
    expect(predicate(new ItemIngredient("minecraft:water"))).toBeFalse();
    expect(predicate(new FluidTagIngredient("minecraft:water"))).toBeFalse();
    expect(predicate(new ItemTagIngredient("minecraft:water"))).toBeFalse();
  });

  it("matches fluid ingredients using tag", () => {
    const predicate = loader.resolveIngredientTest(
      new FluidTagIngredient("minecraft:water"),
    );

    expect(predicate(new FluidIngredient("minecraft:water"))).toBeTrue();
    expect(
      predicate(new FluidIngredient("minecraft:flowing_water")),
    ).toBeTrue();
    expect(predicate(new FluidTagIngredient("minecraft:water"))).toBeTrue();

    expect(predicate(new FluidIngredient("minecraft:lava"))).toBeFalse();
    expect(predicate(new FluidTagIngredient("minecraft:lava"))).toBeFalse();
    expect(predicate(new ItemIngredient("minecraft:water"))).toBeFalse();
    expect(predicate(new ItemTagIngredient("minecraft:water"))).toBeFalse();
  });
});

describe("ingredient tests applying to blocks", () => {
  it("matches block ingredients", () => {
    const predicate = loader.resolveIngredientTest(
      new BlockIngredient("minecraft:water"),
    );

    expect(predicate(new BlockIngredient("minecraft:water"))).toBeTrue();

    expect(predicate(new FluidIngredient("minecraft:lava"))).toBeFalse();
    expect(predicate(new ItemIngredient("minecraft:water"))).toBeFalse();
    expect(predicate(new FluidTagIngredient("minecraft:water"))).toBeFalse();
    expect(predicate(new ItemTagIngredient("minecraft:water"))).toBeFalse();
  });

  it("matches block ingredients using tag", () => {
    const predicate = loader.resolveIngredientTest(
      new BlockTagIngredient("minecraft:base_stone_overworld"),
    );

    expect(predicate(new BlockIngredient("minecraft:stone"))).toBeTrue();
    expect(predicate(new BlockIngredient("minecraft:andesite"))).toBeTrue();
    expect(
      predicate(new BlockTagIngredient("minecraft:base_stone_overworld")),
    ).toBeTrue();

    expect(predicate(new BlockIngredient("minecraft:obsidian"))).toBeFalse();
    expect(predicate(new FluidIngredient("minecraft:stone"))).toBeFalse();
    expect(
      predicate(new BlockTagIngredient("minecraft:mineable/pickaxe")),
    ).toBeFalse();
    expect(predicate(new ItemIngredient("minecraft:stone"))).toBeFalse();
    expect(predicate(new ItemTagIngredient("minecraft:stone"))).toBeFalse();
  });
});

it("matches nested ingredients in array", () => {
  const predicate = loader.resolveIngredientTest("#minecraft:logs");

  expect(predicate(["minecraft:stone", "minecraft:oak_log"])).toBeTrue();
  expect(
    predicate(["minecraft:stone", "#minecraft:logs_that_burn"]),
  ).toBeTrue();

  expect(predicate(["minecraft:obsidian", "minecraft:netherrack"])).toBeFalse();
});

it("matches ingredients using predicate", () => {
  const predicate = loader.resolveIngredientTest((it) => {
    if (it instanceof ItemTagIngredient)
      return encodeId(it.tag).includes("stone");
    if (it instanceof ItemIngredient) return encodeId(it.id).includes("wool");
    return false;
  });

  expect(predicate(new ItemIngredient("minecraft:red_wool"))).toBeTrue();
  expect(predicate(new ItemIngredient("green_wool"))).toBeTrue();
  expect(predicate(new ItemTagIngredient("example:stone_tools"))).toBeTrue();

  expect(predicate(new ItemIngredient("minecraft:stone_pickaxe"))).toBeFalse();
  expect(predicate(new ItemIngredient("stone_pickaxe"))).toBeFalse();
  expect(predicate(new ItemTagIngredient("minecraft:pink_wool"))).toBeFalse();
});
