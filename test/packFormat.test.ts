import { createTestAcceptor } from "@adeficior/pack-resolver/testing";
import { describe, expect, it } from "bun:test";
import { EMPTY_LOOT_TABLE, EMPTY_RECIPE } from "../src/index.js";
import setupLoader from "./shared/loaderSetup.js";

const version = "1.21.1";
const { loader } = setupLoader({ load: false, version });

describe("loader respects different pack format versions", () => {
  it("folders follow new syntax after 1.21", async () => {
    const acceptor = createTestAcceptor();

    loader.recipes.add("example:test", EMPTY_RECIPE);
    loader.loot.add("example:test", EMPTY_LOOT_TABLE);

    await loader.resolver.extract(acceptor);

    expect(acceptor.jsonAt("data/example/loot_table/test.json")).toMatchObject(
      EMPTY_LOOT_TABLE,
    );
    expect(acceptor.jsonAt("data/example/recipe/test.json")).toMatchObject(
      EMPTY_RECIPE,
    );

    expect(acceptor.jsonAt("data/example/loot_tables/test.json")).toBeNull();
    expect(acceptor.jsonAt("data/example/recipes/test.json")).toBeNull();
  });
});
