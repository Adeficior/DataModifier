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
import { tryCatching } from "../src/error.js";
import { encodeId } from "../src/index.js";
import setupLoader from "./shared/loaderSetup.js";

const { logger, loader } = setupLoader({ include: ["data/*/tags/**/*.json"] });

// @ts-expect-error private
const { ingredients, results } = loader;

// TODO add constants somewhere
const FLUID_AMOUNT = 1000;

describe("tests regarding ingredient/result shapes", () => {
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

  it("warns about tags starting with a #", async () => {
    expect(() => ingredients.create({ tag: "#test" })).toThrow();
    expect(() => ingredients.create({ fluidTag: "#test" })).toThrow();
    expect(() => ingredients.create({ blockTag: "#test" })).toThrow();
  });

  it("does not encounter any unknown ingredient shapes", async () => {
    const acceptor = createTestAcceptor();

    loader.recipes.replaceIngredient("minecraft:coal", {
      item: "minecraft:diamond",
    });
    loader.recipes.replaceIngredient(
      { item: "minecraft:coal" },
      { item: "minecraft:diamond" },
    );
    loader.recipes.replaceIngredient(
      { fluid: "minecraft:water" },
      { item: "minecraft:lava" },
    );
    loader.recipes.replaceIngredient(
      { block: "minecraft:coal_block" },
      { item: "minecraft:diamond_block" },
    );

    await loader.emit(acceptor);

    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("does not encounter any unknown result shapes", async () => {
    const acceptor = createTestAcceptor();

    loader.recipes.replaceResult("minecraft:coal", {
      item: "minecraft:diamond",
    });
    loader.recipes.replaceResult(
      { item: "minecraft:coal" },
      { item: "minecraft:diamond" },
    );
    loader.recipes.replaceResult(
      { fluid: "minecraft:water" },
      { item: "minecraft:lava" },
    );
    loader.recipes.replaceResult(
      { block: "minecraft:coal_block" },
      { item: "minecraft:diamond_block" },
    );

    await loader.emit(acceptor);

    expect(logger.warn).not.toHaveBeenCalled();
  });
});

describe("ingredient tests applying to items", () => {
  it("matches ingredients using regex", () => {
    const predicate = loader.resolveIngredientTest(/.+:spruce_.+/);

    expect(predicate(new ItemIngredient("minecraft:spruce_log"))).toBeTruthy();
    expect(predicate(new ItemIngredient("spruce_fence"))).toBeTruthy();
    expect(
      predicate(new ItemIngredient("a-mod:spruce_something")),
    ).toBeTruthy();
    expect(
      predicate(new ItemTagIngredient("minecraft:spruce_wood")),
    ).toBeTruthy();

    expect(
      predicate(new ItemIngredient("minecraft:stripped_spruce_log")),
    ).toBeFalsy();
    expect(predicate(new ItemIngredient("something:else"))).toBeFalsy();
    expect(
      predicate(new ItemTagIngredient("minecraft:stripped_spruce_wood")),
    ).toBeFalsy();
  });

  it("matches ingredients using item id", () => {
    const predicate = loader.resolveIngredientTest("minecraft:obsidian");

    expect(predicate(new ItemIngredient("minecraft:obsidian"))).toBeTruthy();

    expect(
      predicate(new ItemIngredient("minecraft:obsidian_pillar")),
    ).toBeFalsy();
    expect(predicate(new ItemIngredient("example:obsidian"))).toBeFalsy();
    expect(predicate(new ItemIngredient("minecraft:stone"))).toBeFalsy();
    expect(predicate(new ItemTagIngredient("minecraft:obsidian"))).toBeFalsy();
    expect(
      predicate(new ItemTagIngredient("minecraft:mineable/pickaxe")),
    ).toBeFalsy();
  });

  it("matches ingredients using item tag", () => {
    const predicate = loader.resolveIngredientTest("#minecraft:logs");

    expect(predicate(new ItemIngredient("minecraft:oak_log"))).toBeTruthy();
    expect(predicate(new ItemIngredient("stripped_birch_log"))).toBeTruthy();
    expect(
      predicate(new ItemTagIngredient("minecraft:logs_that_burn")),
    ).toBeTruthy();

    expect(predicate(new ItemIngredient("minecraft:stone"))).toBeFalsy();
    expect(
      predicate(new ItemTagIngredient("minecraft:mineable/axe")),
    ).toBeFalsy();
  });

  it("matches ingredients using item ingredient", () => {
    const predicate = loader.resolveIngredientTest(
      new ItemTagIngredient("minecraft:piglin_loved"),
    );

    expect(
      predicate(new ItemIngredient("minecraft:golden_sword")),
    ).toBeTruthy();
    expect(predicate(new ItemIngredient("golden_apple"))).toBeTruthy();

    expect(predicate(new ItemIngredient("minecraft:ice"))).toBeFalsy();
    expect(predicate(new ItemIngredient("blackstone"))).toBeFalsy();
  });

  it("matches ingredients using tag ingredient", () => {
    const predicate = loader.resolveIngredientTest(
      new ItemIngredient("minecraft:mangrove_leaves"),
    );

    expect(
      predicate(new ItemIngredient("minecraft:mangrove_leaves")),
    ).toBeTruthy();
    expect(predicate(new ItemIngredient("mangrove_leaves"))).toBeTruthy();

    expect(
      predicate(new ItemIngredient("minecraft:mangrove_sapling")),
    ).toBeFalsy();
  });
});

describe("ingredient tests applying to fluids", () => {
  it("matches fluid ingredients", () => {
    const predicate = loader.resolveIngredientTest(
      new FluidIngredient("minecraft:water", FLUID_AMOUNT),
    );

    expect(
      predicate(new FluidIngredient("minecraft:water", FLUID_AMOUNT)),
    ).toBeTruthy();

    expect(
      predicate(new FluidIngredient("minecraft:lava", FLUID_AMOUNT)),
    ).toBeFalsy();
    expect(predicate(new ItemIngredient("minecraft:water"))).toBeFalsy();
    expect(
      predicate(new FluidTagIngredient("minecraft:water", FLUID_AMOUNT)),
    ).toBeFalsy();
    expect(predicate(new ItemTagIngredient("minecraft:water"))).toBeFalsy();
  });

  it("matches fluid ingredients using tag", () => {
    const predicate = loader.resolveIngredientTest(
      new FluidTagIngredient("minecraft:water", FLUID_AMOUNT),
    );

    expect(
      predicate(new FluidIngredient("minecraft:water", FLUID_AMOUNT)),
    ).toBeTruthy();
    expect(
      predicate(new FluidIngredient("minecraft:flowing_water", FLUID_AMOUNT)),
    ).toBeTruthy();
    expect(
      predicate(new FluidTagIngredient("minecraft:water", FLUID_AMOUNT)),
    ).toBeTruthy();

    expect(
      predicate(new FluidIngredient("minecraft:lava", FLUID_AMOUNT)),
    ).toBeFalsy();
    expect(
      predicate(new FluidTagIngredient("minecraft:lava", FLUID_AMOUNT)),
    ).toBeFalsy();
    expect(predicate(new ItemIngredient("minecraft:water"))).toBeFalsy();
    expect(predicate(new ItemTagIngredient("minecraft:water"))).toBeFalsy();
  });
});

describe("ingredient tests applying to blocks", () => {
  it("matches block ingredients", () => {
    const predicate = loader.resolveIngredientTest(
      new BlockIngredient("minecraft:water"),
    );

    expect(predicate(new BlockIngredient("minecraft:water"))).toBeTruthy();

    expect(
      predicate(new FluidIngredient("minecraft:lava", FLUID_AMOUNT)),
    ).toBeFalsy();
    expect(predicate(new ItemIngredient("minecraft:water"))).toBeFalsy();
    expect(
      predicate(new FluidTagIngredient("minecraft:water", FLUID_AMOUNT)),
    ).toBeFalsy();
    expect(predicate(new ItemTagIngredient("minecraft:water"))).toBeFalsy();
  });

  it("matches block ingredients using tag", () => {
    const predicate = loader.resolveIngredientTest(
      new BlockTagIngredient("minecraft:base_stone_overworld"),
    );

    expect(predicate(new BlockIngredient("minecraft:stone"))).toBeTruthy();
    expect(predicate(new BlockIngredient("minecraft:andesite"))).toBeTruthy();
    expect(
      predicate(new BlockTagIngredient("minecraft:base_stone_overworld")),
    ).toBeTruthy();

    expect(predicate(new BlockIngredient("minecraft:obsidian"))).toBeFalsy();
    expect(
      predicate(new FluidIngredient("minecraft:stone", FLUID_AMOUNT)),
    ).toBeFalsy();
    expect(
      predicate(new BlockTagIngredient("minecraft:mineable/pickaxe")),
    ).toBeFalsy();
    expect(predicate(new ItemIngredient("minecraft:stone"))).toBeFalsy();
    expect(predicate(new ItemTagIngredient("minecraft:stone"))).toBeFalsy();
  });
});

it("matches nested ingredients in array", () => {
  const predicate = loader.resolveIngredientTest("#minecraft:logs");

  expect(predicate(["minecraft:stone", "minecraft:oak_log"])).toBeTruthy();
  expect(
    predicate(["minecraft:stone", "#minecraft:logs_that_burn"]),
  ).toBeTruthy();

  expect(predicate(["minecraft:obsidian", "minecraft:netherrack"])).toBeFalsy();
});

it("matches ingredients using predicate", () => {
  const predicate = loader.resolveIngredientTest((it) => {
    if (it instanceof ItemTagIngredient)
      return encodeId(it.tag).includes("stone");
    if (it instanceof ItemIngredient) return encodeId(it.id).includes("wool");
    return false;
  });

  expect(predicate(new ItemIngredient("minecraft:red_wool"))).toBeTruthy();
  expect(predicate(new ItemIngredient("green_wool"))).toBeTruthy();
  expect(predicate(new ItemTagIngredient("example:stone_tools"))).toBeTruthy();

  expect(predicate(new ItemIngredient("minecraft:stone_pickaxe"))).toBeFalsy();
  expect(predicate(new ItemIngredient("stone_pickaxe"))).toBeFalsy();
  expect(predicate(new ItemTagIngredient("minecraft:pink_wool"))).toBeFalsy();
});
