import { ItemTagIngredient } from "@adeficior/data-modifier-ingredients";
import { setupRecipeEmitter } from "@adeficior/data-modifier-recipes/testing";
import { createTestAcceptor } from "@adeficior/pack-resolver/testing";
import { describe, expect, it } from "bun:test";
import { basename } from "node:path";
import { recipeOptions } from "../options";

const version = basename(import.meta.dir);
const { emitter, resolver } = setupRecipeEmitter(version, recipeOptions);

describe("recipe ingredient replacement", () => {
  it("replaces ingredients in create recipes", async () => {
    const acceptor = createTestAcceptor();

    emitter.replaceIngredient(
      "#forge:raw_materials/zinc",
      new ItemTagIngredient("forge:raw_materials/iron"),
    );

    await resolver.extract(acceptor);

    expect(
      acceptor.jsonAt(
        "data/create/recipes/crafting/materials/raw_zinc_block.json",
      ),
    ).toMatchSnapshot("modified create:raw_zinc_block recipe");
    expect(
      acceptor.jsonAt("data/create/recipes/crushing/raw_zinc.json"),
    ).toMatchSnapshot("modified create:raw_zinc recipe");
    expect(
      acceptor.jsonAt(
        "data/create/recipes/blasting/zinc_ingot_from_raw_ore.json",
      ),
    ).toMatchSnapshot("modified create:zinc_ingot_from_raw_ore recipe");
    expect(
      acceptor.jsonAt(
        "data/create/recipes/smelting/zinc_ingot_from_raw_ore.json",
      ),
    ).toMatchSnapshot("modified create:zinc_ingot_from_raw_ore recipe");
  });
});
