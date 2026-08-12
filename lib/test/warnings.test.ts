import { ItemResult } from "@adeficior/data-modifier-ingredients";
import { createTestAcceptor } from "@adeficior/pack-resolver/testing";
import { describe, expect, it } from "bun:test";
import { setupInstance } from "./util/setup";

const version = "1.20.1";
const instance = await setupInstance(version, {
  include: ["data/*/recipes/**/*.json"],
  from: "failing",
});

// TOOD could be instance.reipes with frontmatter
const recipesEmitter = instance.get("emitter:recipes");

describe("tests regarding error logging", () => {
  it("warns about incorrect result shape only once", async () => {
    const acceptor = createTestAcceptor();

    recipesEmitter.replaceResult(
      "minecraft:stone",
      new ItemResult("minecraft:deepslate"),
    );
    recipesEmitter.replaceResult(
      "minecraft:stone",
      new ItemResult("minecraft:obsidian"),
    );

    await instance.emit(acceptor);

    expect(instance.logger.trace).toHaveBeenCalledWith(
      "unknown result shape",
      expect.objectContaining({
        input: 120,
        path: "data/example/recipes/incorrectResult.json",
      }),
    );
  });
});
