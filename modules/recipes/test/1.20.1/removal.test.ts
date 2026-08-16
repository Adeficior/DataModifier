import { createTestAcceptor } from "@adeficior/pack-resolver/testing";
import { describe, expect, it } from "bun:test";
import { basename } from "node:path";
import { EMPTY_RECIPE } from "../../src";
import type { RecipeTest } from "../../src";
import { setupRecipeEmitter } from "../../src/testing";

const version = basename(import.meta.dir);
const { emitter, resolver, logger } = setupRecipeEmitter(version);

describe("recipe removal", () => {
  it("removes recipes with id filter", async () => {
    const acceptor = createTestAcceptor();

    emitter.remove({
      id: /minecraft:.*piston/,
    });

    await resolver.extract(acceptor);

    expect(acceptor.paths()).toHaveLength(2);

    expect(acceptor.jsonAt("data/minecraft/recipes/piston.json")).toMatchObject(
      EMPTY_RECIPE,
    );
    expect(
      acceptor.jsonAt("data/minecraft/recipes/sticky_piston.json"),
    ).toMatchObject(EMPTY_RECIPE);
  });

  it("removes recipes with type filter", async () => {
    const acceptor = createTestAcceptor();

    emitter.remove({
      type: "minecraft:smelting",
    });

    await resolver.extract(acceptor);

    expect(acceptor.paths()).toHaveLength(70);
  });

  it("removes recipes with result filter", async () => {
    const acceptor = createTestAcceptor();

    emitter.remove({
      output: "minecraft:cooked_beef",
    });

    await resolver.extract(acceptor);

    expect(acceptor.paths()).toHaveLength(3);

    expect(
      acceptor.jsonAt("data/minecraft/recipes/cooked_beef.json"),
    ).toMatchObject(EMPTY_RECIPE);
    expect(
      acceptor.jsonAt("data/minecraft/recipes/cooked_beef_from_smoking.json"),
    ).toMatchObject(EMPTY_RECIPE);
    expect(
      acceptor.jsonAt(
        "data/minecraft/recipes/cooked_beef_from_campfire_cooking.json",
      ),
    ).toMatchObject(EMPTY_RECIPE);
  });

  it("warns about missing matches", async () => {
    const test: RecipeTest = {
      type: "example:not_existing",
    };

    emitter.remove(test);

    const acceptor = createTestAcceptor();
    await resolver.extract(acceptor);

    expect(logger.trace).toHaveBeenCalledWith(
      "could not find any recipes matching",
      expect.objectContaining({
        operation: "remove",
        test,
      }),
    );
  });
});
