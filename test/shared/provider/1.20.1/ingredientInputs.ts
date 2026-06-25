import { IllegalShapeError, UnknownRegistryEntry } from "../../../../src";
import type {
  Ingredient} from "../../../../src/common/ingredient";
import {
  BlockIngredient,
  BlockTagIngredient,
  FluidIngredient,
  FluidTagIngredient,
  ItemIngredient,
  ItemTagIngredient,
} from "../../../../src/common/ingredient";
import { BUCKET } from "../../../../src/common/units";
import type { DataProvider } from "../providers";

// TODO add somewhere
export interface Class<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): T;
}

export function* invalidIngredientInputs(): DataProvider<
  [unknown, Class<Error> | string]
> {
  yield ["array", ["minecraft:apple", { whatever: true }], IllegalShapeError];
  yield ["invalid object", { whatever: true }, IllegalShapeError];
  yield ["empty object", {}, IllegalShapeError];
  yield ["number", 10, IllegalShapeError];
  yield ["null", null, IllegalShapeError];

  yield ["item tag with #", { tag: "#test" }, IllegalShapeError];
  yield [
    "fluid tag with #",
    { fluidTag: "#test", amount: BUCKET },
    IllegalShapeError,
  ];
  yield ["block tag with #", { blockTag: "#test" }, IllegalShapeError];
  yield [
    "item tag with negative count",
    { tag: "buttons", count: -21 },
    IllegalShapeError,
  ];
  yield [
    "item with zero count",
    { item: "oak_button", count: 0 },
    IllegalShapeError,
  ];
  yield [
    "fluid tag with negative amount",
    { fluidTag: "water", amount: -21 },
    IllegalShapeError,
  ];
  yield [
    "item with zero amount",
    { fluid: "lava", amount: 0 },
    IllegalShapeError,
  ];

  yield ["unknown item ID", "minecraft:unknown", UnknownRegistryEntry];
  yield [
    "unknown item",
    { item: "minecraft:unknown", count: 12 },
    UnknownRegistryEntry,
  ];
  yield [
    "unknown fluid",
    { fluid: "minecraft:unknown", amount: BUCKET },
    UnknownRegistryEntry,
  ];
  yield ["unknown block", { block: "minecraft:unknown" }, UnknownRegistryEntry];
}

export function* ingredientInputs(): DataProvider<
  [unknown, Class<Ingredient>]
> {
  yield ["item ID with namespace", "minecraft:stone", ItemIngredient];
  yield ["item ID without namespace", "obsidian", ItemIngredient];
  yield ["item without count", { item: "minecraft:carrot" }, ItemIngredient];
  yield [
    "item with count",
    { item: "minecraft:carrot", count: 7 },
    ItemIngredient,
  ];

  yield ["item tag ID with namespace", "#minecraft:planks", ItemTagIngredient];
  yield ["item tag ID without namespace", "#logs", ItemTagIngredient];
  yield [
    "item tag without count",
    { tag: "minecraft:carrot" },
    ItemTagIngredient,
  ];
  yield [
    "item tag with count",
    { tag: "minecraft:carrot", count: 20 },
    ItemTagIngredient,
  ];

  yield ["block", { block: "minecraft:gold_block" }, BlockIngredient];

  yield ["block tag", { blockTag: "mineable/pickaxe" }, BlockTagIngredient];

  yield ["fluid", { fluid: "lava", amount: BUCKET }, FluidIngredient];

  yield [
    "fluid tag",
    { fluidTag: "minecraft:water", amount: BUCKET },
    FluidTagIngredient,
  ];
}
