import {
  BlockIngredient,
  BlockTagIngredient,
  FluidIngredient,
  FluidTagIngredient,
} from "../../../../src/common/ingredient";
import type { IngredientFilter } from "../../../../src/common/ingredient/filter";
import type { IngredientInput } from "../../../../src/common/ingredient/input";
import { BUCKET } from "../../../../src/common/units";
import type { DataProvider } from "../providers";

export function* matchingIngredientFilters(): DataProvider<
  [IngredientFilter, IngredientInput]
> {
  yield [
    "item id by item id",
    "minecraft:cooked_beef",
    "minecraft:cooked_beef",
  ];
  yield ["item id by item tag", "#pickaxes", "minecraft:diamond_pickaxe"];
  yield ["item id by nested item tag", "#buttons", "minecraft:oak_button"];
  yield ["item tag by item tag", "#stairs", "#stairs"];
  yield ["item tag by nested item tag", "#buttons", "#wooden_buttons"];

  yield [
    "block by block",
    new BlockIngredient("minecraft:ice"),
    new BlockIngredient("ice"),
  ];
  yield [
    "block by block tag",
    new BlockTagIngredient("rails"),
    new BlockIngredient("minecraft:powered_rail"),
  ];
  yield [
    "block by nested block tag",
    new BlockTagIngredient("minecraft:logs"),
    new BlockIngredient("oak_log"),
  ];
  yield [
    "block tag by block tag",
    new BlockTagIngredient("stairs"),
    new BlockTagIngredient("minecraft:stairs"),
  ];
  yield [
    "block tag by nested block tag",
    new BlockTagIngredient("minecraft:logs"),
    new BlockTagIngredient("logs_that_burn"),
  ];

  yield [
    "fluid by fluid",
    new FluidIngredient("minecraft:lava", BUCKET * 2),
    new FluidIngredient("lava", BUCKET),
  ];
  yield [
    "fluid by fluid tag",
    new FluidTagIngredient("lava"),
    new FluidIngredient("minecraft:lava"),
  ];
  yield [
    "fluid tag by fluid tag",
    new FluidTagIngredient("stairs"),
    new FluidTagIngredient("minecraft:stairs"),
  ];
}

export function* missingIngredientFilters(): DataProvider<
  [IngredientFilter, IngredientInput]
> {
  yield ["item id by item id", "minecraft:cooked_beef", "minecraft:redstone"];
  yield ["item id by item tag", "#banners", "minecraft:diamond"];
  yield ["item tag by item tag", "#banners", "stairs"];

  yield [
    "block by block",
    new BlockIngredient("minecraft:ice"),
    new BlockIngredient("minecraft:packed_ice"),
  ];
  yield [
    "block by block tag",
    new BlockTagIngredient("planks"),
    new BlockIngredient("minecraft:grass_block"),
  ];
  yield [
    "block tag by block tag",
    new BlockTagIngredient("planks"),
    new BlockIngredient("minecraft:portals"),
  ];

  yield [
    "fluid by fluid",
    new FluidIngredient("minecraft:lava"),
    new FluidIngredient("minecraft:water"),
  ];
  yield [
    "fluid by fluid tag",
    new FluidTagIngredient("minecraft:lava"),
    new FluidIngredient("minecraft:water"),
  ];
  yield [
    "fluid tag by fluid tag",
    new FluidTagIngredient("minecraft:lava"),
    new FluidTagIngredient("minecraft:water"),
  ];
}
