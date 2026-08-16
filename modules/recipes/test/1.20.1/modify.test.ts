import {
  ItemIngredient,
  ItemResult,
} from "@adeficior/data-modifier-ingredients";
import { createTestAcceptor } from "@adeficior/pack-resolver/testing";
import { describe, expect, it } from "bun:test";
import { basename } from "node:path";
import { EMPTY_RECIPE } from "../../src";
import { setupRecipeEmitter } from "../../src/testing";

const version = basename(import.meta.dir);
const { emitter, resolver, logger } = setupRecipeEmitter(version);

describe("recipe ingredient replacement", () => {
  it("replaces item ingredient", async () => {
    const acceptor = createTestAcceptor();

    emitter.replaceIngredient(
      "minecraft:redstone",
      new ItemIngredient("minecraft:emerald"),
    );

    await resolver.extract(acceptor);

    expect(
      acceptor.jsonAt("data/minecraft/recipes/piston.json"),
    ).toMatchSnapshot("modified piston recipe");
    expect(
      acceptor.jsonAt("data/minecraft/recipes/compass.json"),
    ).toMatchSnapshot("modified compass recipe");

    expect(acceptor.paths()).toMatchSnapshot(
      "recipes including redstone as an ingredient",
    );
  });

  it("replaces ingredients with additional input filter", async () => {
    const acceptor = createTestAcceptor();

    emitter.replaceIngredient(
      "minecraft:redstone",
      new ItemIngredient("minecraft:emerald"),
      {
        input: "#minecraft:planks",
      },
    );

    await resolver.extract(acceptor);

    expect(
      acceptor.jsonAt("data/minecraft/recipes/piston.json"),
    ).toMatchSnapshot("modified piston recipe");
    expect(
      acceptor.jsonAt("data/minecraft/recipes/note_block.json"),
    ).toMatchSnapshot("modified note_block recipe");
    expect(acceptor.jsonAt("data/minecraft/recipes/compass.json")).toBeNull();
  });

  it("matches recipes wrapped in forge:conditional", async () => {
    const acceptor = createTestAcceptor();

    emitter.remove({
      input: new ItemIngredient("minecraft:poppy"),
      type: "minecraft:crafting_shapeless",
    });

    await resolver.extract(acceptor);

    expect(
      acceptor.jsonAt("data/custom/recipes/conditional.json"),
    ).toMatchObject(EMPTY_RECIPE);
  });

  it("warns about missing matches", async () => {
    const from = "minecraft:bedrock";
    const to = new ItemResult("minecraft:dirt");
    emitter.replaceResult(from, to);

    const acceptor = createTestAcceptor();
    await resolver.extract(acceptor);

    expect(logger.trace).toHaveBeenCalledWith(
      "could not find any recipes matching",
      expect.objectContaining({
        operation: "replace result",
        from,
        to,
      }),
    );
  });
});
