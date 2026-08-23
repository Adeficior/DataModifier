import { IllegalShapeError } from "@adeficior/data-modifier-core/serializer";
import { describe, expect, it } from "bun:test";
import { IngredientMap, ItemIngredient, ItemTagIngredient } from "../src";

describe("IngredientMap", () => {
  it("generated pattern", () => {
    const { ingredients, pattern } = IngredientMap.from([
      [
        new ItemIngredient("minecraft:stone"),
        new ItemIngredient("minecraft:redstone"),
        new ItemIngredient("minecraft:stone"),
      ],
      [
        new ItemIngredient("minecraft:stone"),
        new ItemTagIngredient("minecraft:planks"),
        new ItemIngredient("minecraft:stone"),
      ],
      [
        new ItemIngredient("minecraft:dark_oak_planks"),
        new ItemIngredient("minecraft:stone"),
        new ItemIngredient("minecraft:dark_oak_planks"),
      ],
    ]);

    expect(pattern).toMatchObject(["ABA", "ACA", "DAD"]);
    expect(ingredients).toMatchObject(
      new IngredientMap({
        A: new ItemIngredient("minecraft:stone"),
        B: new ItemIngredient("minecraft:redstone"),
        C: new ItemTagIngredient("minecraft:planks"),
        D: new ItemIngredient("minecraft:dark_oak_planks"),
      }),
    );
  });

  it("validates pattern dimensions", () => {
    expect(() => {
      IngredientMap.from([
        [
          new ItemIngredient("minecraft:stone"),
          new ItemIngredient("minecraft:redstone"),
          new ItemIngredient("minecraft:stone"),
        ],
        [
          new ItemIngredient("minecraft:stone"),
          new ItemIngredient("minecraft:stone"),
        ],
      ]);
    }).toThrowError(IllegalShapeError);
  });
});
