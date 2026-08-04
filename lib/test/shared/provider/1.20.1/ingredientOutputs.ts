import type { Ingredient } from "../../../../src/common/ingredient";
import {
  BlockIngredient,
  BlockTagIngredient,
  FluidIngredient,
  FluidTagIngredient,
  ItemIngredient,
  ItemTagIngredient,
  ListIngredient,
} from "../../../../src/common/ingredient";
import { BUCKET } from "../../../../src/common/units";
import type { DataProvider } from "../providers";

export function* serializedIngredients(): DataProvider<[Ingredient, object]> {
  yield [
    "item ingredient",
    new ItemIngredient("minecraft:golden_carrot"),
    { item: "minecraft:golden_carrot" },
  ];
  yield [
    "item ingredient with count",
    new ItemIngredient("minecraft:golden_carrot", 12),
    { item: "minecraft:golden_carrot", count: 12 },
  ];
  yield [
    "item ingredient with default count",
    new ItemIngredient("minecraft:golden_carrot", 1),
    { item: "minecraft:golden_carrot" },
  ];
  yield [
    "block ingredient",
    new BlockIngredient("minecraft:oak_stairs"),
    { block: "minecraft:oak_stairs" },
  ];
  yield [
    "item ingredient",
    new FluidIngredient("minecraft:lava"),
    { fluid: "minecraft:lava", amount: BUCKET },
  ];
  yield [
    "item tag ingredient",
    new ItemTagIngredient("redstone_block"),
    { tag: "minecraft:redstone_block" },
  ];
  yield [
    "block tag ingredient",
    new BlockTagIngredient("stairs"),
    { blockTag: "minecraft:stairs" },
  ];
  yield [
    "item tag ingredient",
    new FluidTagIngredient("minecraft:lava", 200),
    { fluidTag: "minecraft:lava", amount: 200 },
  ];
  yield [
    "list ingredient",
    new ListIngredient([
      new FluidTagIngredient("minecraft:water"),
      new FluidIngredient("minecraft:lava", 10),
    ]),
    [
      { fluidTag: "minecraft:water", amount: BUCKET },
      { fluid: "minecraft:lava", amount: 10 },
    ],
  ];
  yield [
    "nested list ingredient",
    new ListIngredient([
      new FluidTagIngredient("minecraft:water"),
      new ListIngredient([
        new ItemIngredient("minecraft:cobblestone"),
        new BlockIngredient("minecraft:obsidian"),
      ]),
    ]),
    [
      { fluidTag: "minecraft:water", amount: BUCKET },
      { item: "minecraft:cobblestone" },
      { block: "minecraft:obsidian" },
    ],
  ];
}
