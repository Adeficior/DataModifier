import { createTestAcceptor } from "@adeficior/pack-resolver/testing";
import { describe, expect, it } from "bun:test";
import { type RecipeGraphAccessor } from "../src/emit/recipeGraph";
import { setupInstance } from "./util/setup";

const instance = await setupInstance("1.21.1", {
  include: ["data/*/recipe/**/*.json", "data/*/tags/**/*.json"],
});

const recipeGraph = instance.get<RecipeGraphAccessor>("emitter:graph:recipes");

describe("recipe graph", () => {
  it("generated nodes & edges", async () => {
    const acceptor = createTestAcceptor();

    recipeGraph.show("minecraft:chest");
    recipeGraph.show("minecraft:oak_stairs");
    recipeGraph.show("minecraft:oak_slab");
    recipeGraph.show("minecraft:oak_planks");

    await instance.emit(acceptor);

    expect(acceptor.jsonAt("graph/nodes.json")).toMatchSnapshot("nodes.json");
    expect(acceptor.jsonAt("graph/edges.json")).toMatchSnapshot("edges.json");
  });
});
