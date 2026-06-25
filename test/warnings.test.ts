import { createTestAcceptor } from "@adeficior/pack-resolver/testing";
import { describe, expect, it } from "bun:test";
import { ItemResult } from "../src/common/result/index.js";
import setupLoader from "./shared/loaderSetup.js";

const version = "1.20.1";
const { logger, loader } = setupLoader({
  version,
  include: ["data/*/recipes/**/*.json"],
  from: "failing",
});

describe("tests regarding error logging", () => {
  it("warns about incorrect result shape only once", async () => {
    const acceptor = createTestAcceptor();

    loader.recipes.replaceResult(
      "minecraft:stone",
      new ItemResult("minecraft:deepslate"),
    );
    loader.recipes.replaceResult(
      "minecraft:stone",
      new ItemResult("minecraft:obsidian"),
    );

    await loader.emit(acceptor);

    expect(logger.warn).toHaveBeenCalledWith(
      `data/example/recipes/incorrectResult.json -> unknown result shape`,
      120,
    );
  });
});
