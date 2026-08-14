import type { LoaderContext } from "@adeficior/data-modifier-core";
import { createLogger } from "@adeficior/pack-resolver";
import { createTestAcceptor } from "@adeficior/pack-resolver/testing";
import { afterEach, describe, expect, it } from "bun:test";
import { createBlockDefinitionEmitter } from "./util/emitters";

const version = "1.20.1";
const context: LoaderContext = { logger: createLogger() };
const { emitter, resolver, reset } = createBlockDefinitionEmitter(
  version,
  context,
);

afterEach(reset);

describe("block definitions", () => {
  it("generates additional resources for block definitions", async () => {
    const acceptor = createTestAcceptor();

    emitter.basic("example:ruby_ore", { material: "stone" });

    await resolver.extract(acceptor);

    expect(
      acceptor.jsonAt("content/example/block/ruby_ore.json"),
    ).toMatchSnapshot("basic block definition");
    expect(
      acceptor.jsonAt("data/example/loot_tables/blocks/ruby_ore.json"),
    ).toMatchSnapshot("basic loot table");
    expect(
      acceptor.jsonAt("assets/example/blockstates/ruby_ore.json"),
    ).toMatchSnapshot("basic blockstate");
    expect(
      acceptor.jsonAt("assets/example/models/block/ruby_ore.json"),
    ).toMatchSnapshot("basic block model");
  });

  it("uses custom definition types", async () => {
    const acceptor = createTestAcceptor();

    emitter.basic("example:sapphire_block", {
      material: "stone",
      type: "example_block",
    });

    await resolver.extract(acceptor);

    expect(
      acceptor.jsonAt("content/example/block/sapphire_block.json"),
    ).toMatchObject({ type: "example_block" });
  });

  it("correctly resolves copy reference for block properties", async () => {
    const acceptor = createTestAcceptor();

    emitter.basic("example:ruby_ore", {
      material: "stone",
      copy: "minecraft:emerald_ore",
    });

    await resolver.extract(acceptor);

    expect(
      acceptor.jsonAt("content/example/block/ruby_ore.json"),
    ).toMatchSnapshot("block definition using reference for properties");
  });
});
