import { createId } from "@adeficior/data-modifier-core";
import {
  IngredientMap,
  ItemIngredient,
  ItemResult,
  ItemTagIngredient,
} from "@adeficior/data-modifier-ingredients";
import type { RecipeSerializerId } from "@adeficior/data-modifier/generated";
import type { DataProvider, ProvidedData } from "@adeficior/testing";
import type { Recipe } from "../../src";
import {
  ForgeConditionalRecipe,
  ShapedRecipe,
  ShapelessRecipe,
  SmeltingRecipe,
  SmithingRecipe,
  StonecuttingRecipe,
} from "../../src";
import { RecipeHolder } from "../../src/serializer/holder";

function provide(
  type: RecipeSerializerId,
  recipe: Recipe,
): ProvidedData<[RecipeSerializerId, Recipe]> {
  return [createId(type).path, type, recipe];
}

export function* recipes(): DataProvider<[RecipeSerializerId, Recipe]> {
  yield provide(
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
  );

  yield provide(
    "minecraft:crafting_shapeless",
    new ShapelessRecipe(
      [new ItemTagIngredient("c:plates/iron")],
      new ItemResult("minecraft:iron_ingot"),
    ),
  );

  yield provide(
    "minecraft:smelting",
    new SmeltingRecipe(
      new ItemTagIngredient("c:plates/iron"),
      new ItemResult("minecraft:iron_ingot"),
      { experience: 10 },
    ),
  );

  yield provide(
    "minecraft:smoking",
    new SmeltingRecipe(
      new ItemTagIngredient("c:plates/iron"),
      new ItemResult("minecraft:iron_ingot"),
    ),
  );

  yield provide(
    "minecraft:blasting",
    new SmeltingRecipe(
      new ItemTagIngredient("c:plates/iron"),
      new ItemResult("minecraft:iron_ingot"),
    ),
  );

  yield provide(
    "minecraft:campfire_cooking",
    new SmeltingRecipe(
      new ItemTagIngredient("c:plates/iron"),
      new ItemResult("minecraft:iron_ingot"),
    ),
  );

  yield provide(
    "minecraft:smithing",
    new SmithingRecipe(
      new ItemTagIngredient("c:plates/iron"),
      new ItemIngredient("minecraft:apple"),
      new ItemResult("minecraft:iron_ingot"),
      undefined,
    ),
  );

  yield provide(
    "minecraft:smithing_trim",
    new SmithingRecipe(
      new ItemTagIngredient("c:plates/iron"),
      new ItemIngredient("minecraft:apple"),
      undefined,
      undefined,
    ),
  );

  yield provide(
    "minecraft:smithing_transform",
    new SmithingRecipe(
      new ItemTagIngredient("c:plates/iron"),
      new ItemIngredient("minecraft:apple"),
      new ItemResult("minecraft:iron_ingot"),
      new ItemIngredient("minecraft:diamond"),
    ),
  );

  yield provide(
    "minecraft:stonecutting",
    new StonecuttingRecipe(
      new ItemIngredient("minecraft:apple"),
      new ItemResult("minecraft:iron_ingot"),
    ),
  );

  yield provide(
    "forge:conditional",
    new ForgeConditionalRecipe([
      {
        conditions: [{ type: "whatever" }],
        recipe: RecipeHolder.of(
          "minecraft:crafting_shapeless",
          new ShapelessRecipe(
            [new ItemIngredient("minecraft:apple")],
            new ItemResult("minecraft:iron_ingot"),
          ),
        ),
      },
      {
        conditions: [{ type: "else" }],
        recipe: RecipeHolder.of(
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
        ),
      },
    ]),
  );
}
