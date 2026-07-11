import { createTestAcceptor } from "@adeficior/pack-resolver/testing";
import { describe, expect, it } from "bun:test";
import setupLoader from "./shared/loaderSetup";

const { loader } = setupLoader({
  version: "1.21.1",
  include: "data/*/recipe/**/*.json",
});

describe("recipe graph", () => {
  it("generated nodes & edges", async () => {
    const acceptor = createTestAcceptor();

    loader.recipeGraph.show("minecraft:oak_stairs");
    loader.recipeGraph.show("minecraft:oak_slab");
    loader.recipeGraph.show("minecraft:oak_planks");

    await loader.emit(acceptor);

    expect(acceptor.jsonAt("graph/nodes.json")).toMatchSnapshot("nodes.json");
    expect(acceptor.jsonAt("graph/edges.json")).toMatchSnapshot("edges.json");
  });
});
