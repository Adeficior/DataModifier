import {
  IngredientMap,
  ItemIngredient,
  ItemResult,
  ItemTagIngredient,
} from "@adeficior/data-modifier-ingredients";
import type { RecipeSerializerId } from "@adeficior/data-modifier/generated";
import type { DataProvider } from "@adeficior/testing";
import { ShapedRecipe } from "../../src";
import type { Recipe } from "../../src";

export function* recipes(): DataProvider<[RecipeSerializerId, Recipe]> {
  yield [
    "shaped",
    "minecraft:crafting_shaped",
    new ShapedRecipe(
      ["AXA", "XBX", "AXA"],
      new IngredientMap({
        X: new ItemIngredient("minecraft:string"),
        A: new ItemIngredient("minecraft:diamond"),
        B: new ItemTagIngredient("c:ingots/copper"),
      }),
      new ItemResult("minecraft:pumpkin"),
    ),
  ];
}
