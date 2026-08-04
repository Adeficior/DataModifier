import type { Class } from "../../../../src/common/class";
import {
  BlockIngredient,
  BlockTagIngredient,
  FluidIngredient,
  FluidTagIngredient,
  ItemIngredient,
  ItemTagIngredient,
  ListIngredient,
} from "../../../../src/common/ingredient";
import type { IngredientFilter } from "../../../../src/common/ingredient/filter";
import {
  BlockResult,
  FluidResult,
  ItemResult,
  type Result,
} from "../../../../src/common/result";
import { BUCKET } from "../../../../src/common/units";
import type { DataProvider } from "../providers";

export function* matchingResultFilters(): DataProvider<
  [IngredientFilter, Result]
> {
  yield [
    "item by item",
    new ItemIngredient("minecraft:ice", 10),
    new ItemResult("ice", 2),
  ];
  yield [
    "item by item tag",
    new ItemTagIngredient("rails"),
    new ItemResult("minecraft:powered_rail", 18),
  ];
  yield [
    "item by nested item tag",
    new ItemTagIngredient("minecraft:logs", 123),
    new ItemResult("oak_log", 3),
  ];

  yield [
    "block by block",
    new BlockIngredient("minecraft:ice"),
    new BlockResult("ice"),
  ];
  yield [
    "block by block tag",
    new BlockTagIngredient("rails"),
    new BlockResult("minecraft:powered_rail"),
  ];
  yield [
    "block by nested block tag",
    new BlockTagIngredient("minecraft:logs"),
    new BlockResult("oak_log"),
  ];

  yield [
    "fluid by fluid",
    new FluidIngredient("minecraft:lava", BUCKET * 2),
    new FluidResult("lava", BUCKET),
  ];
  yield [
    "fluid by fluid tag",
    new FluidTagIngredient("lava"),
    new FluidResult("minecraft:lava"),
  ];

  yield [
    "block by list",
    new ListIngredient([
      new BlockTagIngredient("base_stone_overworld"),
      new ItemIngredient("gold_nugget"),
    ]),
    new BlockResult("stone"),
  ];

  yield [
    "item by regex",
    /^.+:birch_/,
    new ItemResult("minecraft:birch_stairs"),
  ];
}

export function* missingResultFilters(): DataProvider<
  [IngredientFilter, Result]
> {
  yield [
    "item by item",
    new ItemIngredient("minecraft:ice"),
    new ItemResult("minecraft:packed_ice"),
  ];
  yield [
    "item by item tag",
    new ItemTagIngredient("shovels"),
    new ItemResult("minecraft:granite"),
  ];

  yield [
    "block by block",
    new BlockIngredient("minecraft:ice"),
    new BlockResult("minecraft:packed_ice"),
  ];
  yield [
    "block by block tag",
    new BlockTagIngredient("planks"),
    new BlockResult("minecraft:grass_block"),
  ];

  yield [
    "fluid by fluid",
    new FluidIngredient("minecraft:lava"),
    new FluidResult("minecraft:water"),
  ];
  yield [
    "fluid by fluid tag",
    new FluidTagIngredient("minecraft:lava"),
    new FluidResult("minecraft:water"),
  ];

  yield [
    "block by regex",
    /^.+:birch_/,
    new BlockResult("minecraft:birch_stairs"),
  ];
  yield ["fluid by regex", /.*/, new FluidResult("minecraft:lava")];

  yield [
    "fluid by predicate",
    (it) => it instanceof BlockIngredient,
    new FluidResult("lava"),
  ];
}

export function* invalidResultFilters(): DataProvider<
  [IngredientFilter, Class<Error> | string]
> {
  yield [
    "unknown item id",
    "minecraft:whatever",
    "unknown minecraft:item 'minecraft:whatever'",
  ];
  yield [
    "unknown block id",
    new BlockIngredient("minecraft:whatever"),
    "unknown minecraft:block 'minecraft:whatever'",
  ];
  yield [
    "unknown fluid id",
    new FluidIngredient("minecraft:whatever"),
    "unknown minecraft:fluid 'minecraft:whatever'",
  ];
}
