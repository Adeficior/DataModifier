import type { Class } from "../../../../src/common/class";
import type { Result } from "../../../../src/common/result";
import { FluidResult, ItemResult } from "../../../../src/common/result";
import { BUCKET } from "../../../../src/common/units";
import type { DataProvider } from "../providers";
import { resultLikeIngredients } from "../resultInputs";

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
    { id: "minecraft:apple", count: -21 },
    "count: Too small: expected number to be >0",
  ];
  yield [
    "item with zero count",
    { id: "oak_button", count: 0 },
    "count: Too small: expected number to be >0",
  ];
  yield [
    "fluid with negative amount",
    { id: "water", amount: -21 },
    "amount: Too small: expected number to be >0",
  ];
  yield [
    "item with zero amount",
    { id: "lava", amount: 0 },
    "amount: Too small: expected number to be >0",
  ];

  yield [
    "unknown item ID",
    "minecraft:unknown",
    "unknown minecraft:item 'minecraft:unknown'",
  ];
  yield [
    "unknown item",
    { id: "minecraft:unknown", count: 12 },
    "unknown minecraft:item 'minecraft:unknown'",
  ];
  yield [
    "unknown fluid",
    { id: "minecraft:unknown", amount: BUCKET },
    "unknown minecraft:fluid 'minecraft:unknown'",
  ];
}

export function* results(): DataProvider<[Result, Class<Result>]> {
  yield ["item result", new ItemResult("minecraft:golden_carrot"), ItemResult];
  yield ["item result", new FluidResult("minecraft:lava"), FluidResult];
}

export function* resultInputs(): DataProvider<[unknown, Class<Result>]> {
  yield ["item ID with namespace", "minecraft:stone", ItemResult];
  yield ["item ID without namespace", "obsidian", ItemResult];
  yield ["item without count", { id: "minecraft:carrot" }, ItemResult];
  yield ["item with count", { id: "minecraft:carrot", count: 7 }, ItemResult];

  yield ["fluid", { id: "lava", amount: BUCKET }, FluidResult];

  for (const result of results()) {
    yield result;
  }

  for (const ingredient of resultLikeIngredients()) {
    yield ingredient;
  }
}
