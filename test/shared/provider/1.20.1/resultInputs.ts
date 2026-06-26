import { IllegalShapeError, UnknownRegistryEntry } from "../../../../src";
import type { Result } from "../../../../src/common/result";
import {
  BlockResult,
  FluidResult,
  ItemResult,
} from "../../../../src/common/result";
import { BUCKET } from "../../../../src/common/units";
import type { Class } from "../../types";
import type { DataProvider } from "../providers";
import { ingredients } from "./ingredientInputs";

export function* invalidResultInputs(): DataProvider<
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
    "item with negative count",
    { item: "minecraft:apple", count: -21 },
    IllegalShapeError,
  ];
  yield [
    "item with zero count",
    { item: "oak_button", count: 0 },
    IllegalShapeError,
  ];
  yield [
    "fluid with negative amount",
    { fluid: "water", amount: -21 },
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

  for (const [name, ingredient] of ingredients()) {
    yield [name, ingredient, IllegalShapeError];
  }
}

export function* results(): DataProvider<[Result, Class<Result>]> {
  yield ["item result", new ItemResult("minecraft:golden_carrot"), ItemResult];
  yield ["block result", new BlockResult("minecraft:oak_stairs"), BlockResult];
  yield ["item result", new FluidResult("minecraft:lava"), FluidResult];
}

export function* resultInputs(): DataProvider<[unknown, Class<Result>]> {
  yield ["item ID with namespace", "minecraft:stone", ItemResult];
  yield ["item ID without namespace", "obsidian", ItemResult];
  yield ["item without count", { item: "minecraft:carrot" }, ItemResult];
  yield ["item with count", { item: "minecraft:carrot", count: 7 }, ItemResult];

  yield ["block", { block: "minecraft:gold_block" }, BlockResult];

  yield ["fluid", { fluid: "lava", amount: BUCKET }, FluidResult];

  for (const result of results()) {
    yield result;
  }
}
