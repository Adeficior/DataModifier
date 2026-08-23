import type { Class } from "@adeficior/data-modifier-core/serializer";
import type { DataProvider } from "@adeficior/testing";
import {
  BlockIngredient,
  BlockResult,
  FluidIngredient,
  FluidResult,
  ItemIngredient,
  ItemResult,
} from "../../../src";
import type { Ingredient, Result } from "../../../src";

export function* resultLikeIngredients(): DataProvider<
  [Ingredient, Class<Result>]
> {
  yield [
    "item result",
    new ItemIngredient("minecraft:golden_carrot"),
    ItemResult,
  ];
  yield [
    "block result",
    new BlockIngredient("minecraft:oak_stairs"),
    BlockResult,
  ];
  yield ["item result", new FluidIngredient("minecraft:lava"), FluidResult];
}
