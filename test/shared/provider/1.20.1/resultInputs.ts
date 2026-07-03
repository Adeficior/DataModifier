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
  yield [
    "array",
    ["minecraft:apple", { whatever: true }],
    "unknown result shape",
  ];
  yield ["invalid object", { whatever: true }, "unknown result shape"];
  yield ["empty object", {}, "unknown result shape"];
  yield ["number", 10, "unknown result shape"];
  yield ["null", null, "result input may not be null"];

  yield [
    "item with negative count",
    { item: "minecraft:apple", count: -21 },
    "count: Number must be greater than 0",
  ];
  yield [
    "item with zero count",
    { item: "oak_button", count: 0 },
    "count: Number must be greater than 0",
  ];
  yield [
    "fluid with negative amount",
    { fluid: "water", amount: -21 },
    "amount: Number must be greater than 0",
  ];
  yield [
    "item with zero amount",
    { fluid: "lava", amount: 0 },
    "amount: Number must be greater than 0",
  ];

  yield [
    "unknown item ID",
    "minecraft:unknown",
    "unknown minecraft:item 'minecraft:unknown'",
  ];
  yield [
    "unknown item",
    { item: "minecraft:unknown", count: 12 },
    "unknown minecraft:item 'minecraft:unknown'",
  ];
  yield [
    "unknown fluid",
    { fluid: "minecraft:unknown", amount: BUCKET },
    "unknown minecraft:fluid 'minecraft:unknown'",
  ];
  yield [
    "unknown block",
    { block: "minecraft:unknown" },
    "unknown minecraft:block 'minecraft:unknown'",
  ];

  for (const [name, ingredient] of ingredients()) {
    yield [name, ingredient, "unknown result shape"];
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
