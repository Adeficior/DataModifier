import { defineModule, packFormatOf } from "@adeficior/data-modifier-core";
import { recipePattern } from "@adeficior/data-modifier-recipes";
import { createTestAcceptor } from "@adeficior/pack-resolver/testing";
import { describe, expect, it } from "bun:test";
import type {
  RecipeGraphAccessor,
  RecipeGraphOptions,
} from "../src/emit/recipeGraph";
import { RecipeGraphEmitter } from "../src/emit/recipeGraph";
import { setupInstance } from "./util/setup";

const module = defineModule<{
  options: RecipeGraphOptions;
  emitters: {
    "graph:recipes": RecipeGraphAccessor;
  };
}>({
  name: "internal",
  dependencies: {
    "@adeficior/data-modifier-recipes": "required",
    "@adeficior/data-modifier-tags": "required",
  },
  setup: (pack) => {
    pack.emitter(
      "graph:recipes",
      (container) =>
        new RecipeGraphEmitter(
          container.get("loader:recipes"),
          container.get("loader:tags"),
          pack.options,
        ),
    );
  },
});

const version = "1.21.1";
const instance = await setupInstance(
  version,
  {
    include: [recipePattern(packFormatOf(version)), "data/*/tags/**/*.json"],
  },
  (modules) => {
    modules.install(module);
  },
);

const recipeGraph = instance.get<RecipeGraphAccessor>("emitter:graph:recipes");

describe("recipe graph", () => {
  it("generated nodes & edges", async () => {
    const acceptor = createTestAcceptor();

    recipeGraph.show("minecraft:chest");
    recipeGraph.show("minecraft:oak_stairs");
    recipeGraph.show("minecraft:oak_slab");
    recipeGraph.show("minecraft:oak_planks");

    await instance.emit(acceptor);

    expect(acceptor.jsonAt("graph/recipe/nodes.json")).toMatchSnapshot(
      "nodes.json",
    );
    expect(acceptor.jsonAt("graph/recipe/edges.json")).toMatchSnapshot(
      "edges.json",
    );
  });
});
