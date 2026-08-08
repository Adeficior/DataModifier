import type { DataProvider } from "@adeficior/testing";
import type { Class } from "../../../../../core/src/common/class";
import {
  BlockIngredient,
  BlockResult,
  FluidIngredient,
  FluidResult,
  ItemIngredient,
  ItemResult,
  type Ingredient,
  type Result,
} from "../../../src";

export function* ingredientLikeResults(): DataProvider<
  [Result, Class<Ingredient>]
> {
  yield [
    "item result",
    new ItemResult("minecraft:golden_carrot"),
    ItemIngredient,
  ];
  yield [
    "block result",
    new BlockResult("minecraft:oak_stairs"),
    BlockIngredient,
  ];
  yield ["item result", new FluidResult("minecraft:lava"), FluidIngredient];
}
