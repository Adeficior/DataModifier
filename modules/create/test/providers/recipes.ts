import { createId } from "@adeficior/data-modifier-core";
import {
  IngredientMap,
  ItemIngredient,
  ItemResult,
  ItemTagIngredient,
} from "@adeficior/data-modifier-ingredients";
import type { Recipe } from "@adeficior/data-modifier-recipes";
import { ShapedRecipe } from "@adeficior/data-modifier-recipes";
import { RecipeHolder } from "@adeficior/data-modifier-recipes/serializer";
import type { RecipeSerializerId } from "@adeficior/data-modifier/generated";
import type { DataProvider, ProvidedData } from "@adeficior/testing";
import { AssemblyRecipe, ProcessingRecipe } from "../../src";

function provide(
  type: RecipeSerializerId,
  recipe: Recipe,
): ProvidedData<[RecipeSerializerId, Recipe]> {
  return [createId(type).path, type, recipe];
}

export function* recipes(): DataProvider<[RecipeSerializerId, Recipe]> {
  yield provide(
    "create:mixing",
    new ProcessingRecipe(
      [new ItemTagIngredient("c:plates/iron")],
      [new ItemResult("minecraft:iron_ingot")],
      {
        heatRequirement: "heated",
        keepHeldItem: true,
        processingTime: 100,
      },
    ),
  );

  yield provide(
    "create:crushing",
    new ProcessingRecipe(
      [new ItemTagIngredient("c:plates/iron")],
      [
        new ItemResult("minecraft:iron_ingot", 4),
        new ItemResult("minecraft:stone", 1, 0.5),
      ],
    ),
  );

  yield provide(
    "create:mechanical_crafting",
    new ShapedRecipe(
      ["AXAXA", "XB BX", "AXAXA", "IIIII"],
      new IngredientMap({
        X: new ItemIngredient("minecraft:string"),
        A: new ItemIngredient("minecraft:diamond"),
        B: new ItemTagIngredient("c:ingots/copper"),
        I: new ItemTagIngredient("c:plates/lead"),
      }),
      new ItemResult("create:large_cogwheel"),
    ),
  );

  yield provide(
    "create:sequenced_assembly",
    new AssemblyRecipe(
      new ItemIngredient("minecraft:string"),
      new ItemIngredient("minecraft:obsidian"),
      [
        new ItemResult("create:zinc_ingot"),
        new ItemResult("create:zinc_nugget", 4, 0.2),
      ],
      [
        RecipeHolder.of(
          "create:compacting",
          new ProcessingRecipe(
            [new ItemTagIngredient("c:plates/iron")],
            [new ItemResult("minecraft:obsidian")],
          ),
        ),
        RecipeHolder.of(
          "create:haunting",
          new ProcessingRecipe(
            [new ItemTagIngredient("c:plates/copper")],
            [new ItemResult("minecraft:obsidian")],
          ),
        ),
      ],
      { loops: 5 },
    ),
  );
}
