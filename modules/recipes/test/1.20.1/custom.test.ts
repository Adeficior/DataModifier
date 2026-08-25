import type { Id, NormalizedId } from "@adeficior/data-modifier-core";
import { packFormatOf } from "@adeficior/data-modifier-core";
import {
  ItemResult,
  ItemTagIngredient,
} from "@adeficior/data-modifier-ingredients";
import { createTestAcceptor } from "@adeficior/pack-resolver/testing";
import { provided } from "@adeficior/testing";
import { describe, expect, it } from "bun:test";
import { basename } from "node:path";
import type { ShapedRecipeDefinition } from "../../src";
import { recipePath, ShapelessRecipe } from "../../src";
import { setupRecipeEmitter } from "../../src/testing";
import { recipes } from "../providers/recipes";

const version = basename(import.meta.dir);
const { emitter, resolver, logger } = setupRecipeEmitter(version);

describe("custom recipe creation", () => {
  it("creates using definition", async () => {
    const acceptor = createTestAcceptor();

    const recipe: ShapedRecipeDefinition = {
      type: "minecraft:shaped",
      key: {
        A: {
          item: "minecraft:diamond",
        },
        B: {
          tag: "minecraft:iron_ores",
        },
      },
      result: {
        item: "minecraft:command_block",
      },
      pattern: ["A ", " B"],
    };

    emitter.add("example:custom", recipe);

    await resolver.extract(acceptor);

    expect(acceptor.jsonAt("data/example/recipes/custom.json")).toMatchObject(
      recipe,
    );
  });

  provided("creates using recipe classes", recipes(), async (type, recipe) => {
    const acceptor = createTestAcceptor();
    const id: Id = { namespace: "test", path: "example" };

    emitter.add(id, type, recipe);

    await resolver.extract(acceptor);

    expect(
      acceptor.jsonAt(recipePath(packFormatOf(version), id)),
    ).toMatchSnapshot("serialized");
  });

  it("creates using recipe with conditions", async () => {
    const acceptor = createTestAcceptor();
    const id: Id = { namespace: "test", path: "example" };

    emitter.add(
      id,
      "crafting_shapeless",
      new ShapelessRecipe(
        [new ItemTagIngredient("c:plates/iron")],
        new ItemResult("minecraft:iron_ingot"),
      ),
      {
        "fabric:load_conditions": [{ condition: "true" }],
        conditions: [{ type: "always" }],
      },
    );

    await resolver.extract(acceptor);

    expect(
      acceptor.jsonAt(recipePath(packFormatOf(version), id)),
    ).toMatchSnapshot("serialized");
  });

  it("warns about duplicate custom recipe IDs", () => {
    const id: NormalizedId = "example:recipe";

    emitter.add(id, { type: "example:something" });
    emitter.add(id, { type: "example:something_else" });

    expect(logger.error).toHaveBeenCalledWith(
      `overwriting custom recipes with ID ${id}`,
    );
  });
});
