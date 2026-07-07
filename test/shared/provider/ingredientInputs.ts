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
import type { Class } from "../../../src/common/class";
import type { DataProvider } from "./providers";

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
