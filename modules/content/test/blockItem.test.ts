import type { LoaderContext } from "@adeficior/data-modifier-core";
import { createLogger } from "@adeficior/pack-resolver";
import { createTestAcceptor } from "@adeficior/pack-resolver/testing";
import { afterEach, describe, expect, it } from "bun:test";
import { createItemDefinitionEmitter } from "./util/emitters";

const version = "1.20.1";
const context: LoaderContext = { logger: createLogger() };
const emitter = createItemDefinitionEmitter(version);

afterEach(() => {
  emitter.clear();
});

describe("block item definitions", () => {
  it("generates block resources for block item definitions", async () => {
    const acceptor = createTestAcceptor();

    emitter.blockItem("example:ruby_block", {
      rarity: "rare",
      block: (blocks) => blocks.basic({ material: "metal" }, { loot: false }),
    });

    await emitter.resolver(context).extract(acceptor);

    expect(
      acceptor.jsonAt("content/example/item/ruby_block.json"),
    ).toMatchSnapshot("basic item definition");
    expect(
      acceptor.jsonAt("assets/example/models/item/ruby_block.json"),
    ).toMatchSnapshot("basic item model");

    expect(
      acceptor.jsonAt("data/example/loot_tables/blocks/ruby_block.json"),
    ).toBeNull();
    expect(acceptor.jsonAt("content/example/block/ruby_block.json")).toBeNull();
    expect(
      acceptor.jsonAt("assets/example/blockstates/ruby_block.json"),
    ).toMatchSnapshot("included blockstate");
    expect(
      acceptor.jsonAt("assets/example/models/block/ruby_block.json"),
    ).toMatchSnapshot("included block model");
  });

  it("uses custom definition types", async () => {
    const acceptor = createTestAcceptor();

    emitter.blockItem("example:sapphire_ore", {
      type: "example_block_item",
      block: (blocks) =>
        blocks.basic({ material: "stone", type: "example_block" }),
    });

    await emitter.resolver(context).extract(acceptor);

    expect(
      acceptor.jsonAt("content/example/item/sapphire_ore.json"),
    ).toMatchObject({
      type: "example_block_item",
      block: {
        type: "example_block",
      },
    });
  });

  it("uses custom definition types for nested block", async () => {
    const acceptor = createTestAcceptor();

    emitter.basic("example:sapphire", { type: "example" });
    emitter.blockItem("example:sapphire_ore", {
      type: "example_block_item",
      block: (blocks) =>
        blocks.add({
          type: "example_block",
          properties: {
            material: "ice",
          },
        }),
    });

    await emitter.resolver(context).extract(acceptor);

    expect(acceptor.jsonAt("content/example/item/sapphire.json")).toMatchObject(
      { type: "example" },
    );
    expect(
      acceptor.jsonAt("content/example/item/sapphire_ore.json"),
    ).toMatchObject({
      type: "example_block_item",
      block: {
        type: "example_block",
      },
    });
  });
});
