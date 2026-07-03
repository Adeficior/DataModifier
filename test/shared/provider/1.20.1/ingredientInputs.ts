import type { Ingredient } from "../../../../src/common/ingredient";
import {
  BlockIngredient,
  BlockTagIngredient,
  FluidIngredient,
  FluidTagIngredient,
  ItemIngredient,
  ItemTagIngredient,
} from "../../../../src/common/ingredient";
import { BUCKET } from "../../../../src/common/units";
import type { Class } from "../../types";
import type { DataProvider } from "../providers";
import { results } from "./resultInputs";

export function* invalidIngredientInputs(): DataProvider<
  [unknown, Class<Error> | string]
> {
  yield [
    "array",
    ["minecraft:apple", { whatever: true }],
    "unknown ingredient shape",
  ];
  yield ["invalid object", { whatever: true }, "unknown ingredient shape"];
  yield ["empty object", {}, "unknown ingredient shape"];
  yield ["number", 10, "unknown ingredient shape"];
  yield ["null", null, "ingredient input may not be null"];

  yield [
    "item tag with #",
    { tag: "#test" },
    "tag: IDs may not start with a hashtag",
  ];
  yield [
    "fluid tag with #",
    { fluidTag: "#test", amount: BUCKET },
    "fluidTag: IDs may not start with a hashtag",
  ];
  yield [
    "block tag with #",
    { blockTag: "#test" },
    "blockTag: IDs may not start with a hashtag",
  ];
  yield [
    "item tag with negative count",
    { tag: "buttons", count: -21 },
    "count: Number must be greater than 0",
  ];
  yield [
    "item with zero count",
    { item: "oak_button", count: 0 },
    "count: Number must be greater than 0",
  ];
  yield [
    "fluid tag with negative amount",
    { fluidTag: "water", amount: -21 },
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

  for (const [name, result] of results()) {
    yield [name, result, "unknown ingredient shape"];
  }
}

export function* ingredients(): DataProvider<[Ingredient, Class<Ingredient>]> {
  yield [
    "item ingredient",
    new ItemIngredient("minecraft:golden_carrot"),
    ItemIngredient,
  ];
  yield [
    "block ingredient",
    new BlockIngredient("minecraft:oak_stairs"),
    BlockIngredient,
  ];
  yield [
    "item ingredient",
    new FluidIngredient("minecraft:lava"),
    FluidIngredient,
  ];
  yield [
    "item tag ingredient",
    new ItemTagIngredient("redstone_block"),
    ItemTagIngredient,
  ];
  yield [
    "block tag ingredient",
    new BlockTagIngredient("stairs"),
    BlockTagIngredient,
  ];
  yield [
    "item tag ingredient",
    new FluidTagIngredient("minecraft:lava"),
    FluidTagIngredient,
  ];
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

  for (const ingredient of ingredients()) {
    yield ingredient;
  }
}
