import {
  type Result,
  BlockResult,
  FluidResult,
  ItemResult,
} from "../../../../src/common/result";
import { BUCKET } from "../../../../src/common/units";
import type { DataProvider } from "../providers";

export function* serializedResults(): DataProvider<[Result, object]> {
  yield [
    "item result",
    new ItemResult("minecraft:golden_carrot"),
    { item: "minecraft:golden_carrot" },
  ];
  yield [
    "item result with count",
    new ItemResult("minecraft:golden_carrot", 12),
    { item: "minecraft:golden_carrot", count: 12 },
  ];
  yield [
    "item result with default count",
    new ItemResult("minecraft:golden_carrot", 1),
    { item: "minecraft:golden_carrot" },
  ];
  yield [
    "block result",
    new BlockResult("minecraft:oak_stairs"),
    { block: "minecraft:oak_stairs" },
  ];
  yield [
    "item result",
    new FluidResult("minecraft:lava"),
    { fluid: "minecraft:lava", amount: BUCKET },
  ];
}
