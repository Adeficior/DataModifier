import type { LoaderContext } from "@adeficior/data-modifier-core";
import { createLogger } from "@adeficior/pack-resolver";
import { createTestAcceptor } from "@adeficior/pack-resolver/testing";
import { afterEach, describe, expect, it } from "bun:test";
import { createItemDefinitionEmitter } from "./util/emitters";

const version = "1.20.1";
const context: LoaderContext = { logger: createLogger() };
const { emitter, resolver, reset } = createItemDefinitionEmitter(
  version,
  context,
);

afterEach(reset);

describe("item definitions", () => {
  it("generates additional resources for item definitions", async () => {
    const acceptor = createTestAcceptor();

    emitter.basic("example:ruby", {
      rarity: "rare",
      stack_size: 24,
    });

    await resolver.extract(acceptor);

    expect(acceptor.jsonAt("content/example/item/ruby.json")).toMatchSnapshot(
      "basic item definition",
    );
    expect(
      acceptor.jsonAt("assets/example/models/item/ruby.json"),
    ).toMatchSnapshot("basic item model");
  });

  it("uses custom definition types", async () => {
    const acceptor = createTestAcceptor();

    emitter.basic("example:sapphire", { type: "example" });

    await resolver.extract(acceptor);

    expect(acceptor.jsonAt("content/example/item/sapphire.json")).toMatchObject(
      { type: "example" },
    );
  });
});
