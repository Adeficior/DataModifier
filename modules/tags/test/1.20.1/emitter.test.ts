import type { LoaderContext } from "@adeficior/data-modifier-core";
import { packFormatOf } from "@adeficior/data-modifier-core";
import {
  createTestAcceptor,
  createTestLogger,
} from "@adeficior/pack-resolver/testing";
import { createTestDataResolver, setupLookup } from "@adeficior/testing";
import { afterEach, beforeAll, describe, expect, it } from "bun:test";
import { basename } from "node:path";
import { TagEmitterImpl } from "../../src/emitter";
import { TagsLoader } from "../../src/loader";

const version = basename(import.meta.dir);
const context: LoaderContext = { logger: createTestLogger() };
const loader = new TagsLoader(packFormatOf(version));
const lookup = setupLookup(version);
const emitter = new TagEmitterImpl(loader, lookup);

beforeAll(async () => {
  const resolver = await createTestDataResolver(version, {
    include: "data/*/tags/**/*.json",
  });
  await resolver.extract(loader);
});

afterEach(() => {
  emitter.clear();
});

describe("adding of tag entries", () => {
  it("adds tag entries", async () => {
    const acceptor = createTestAcceptor();

    emitter.items.add("#minecraft:minable/axe", "minecraft:obsidian");
    emitter.items.add("#minecraft:minable/axe", {
      id: "create:brass_block",
      required: false,
    });

    await emitter.resolver(context).extract(acceptor);

    expect(
      acceptor.jsonAt("data/minecraft/tags/items/minable/axe.json"),
    ).toMatchSnapshot("#mineable/axe content");
  });

  it("adds tag entries to custom registries", async () => {
    const acceptor = createTestAcceptor();

    loader.registerRegistry("whatever/registry");
    emitter.add("whatever/registry", "#example:something", "example:entry");

    await emitter.resolver(context).extract(acceptor);

    expect(
      acceptor.jsonAt("data/example/tags/whatever/registry/something.json"),
    ).toMatchSnapshot("#example:something content");
  });
});

describe("removal of tag entries", () => {
  it("removes tag entries using id", async () => {
    const acceptor = createTestAcceptor();

    emitter.blocks.remove("#minecraft:oak_logs", "minecraft:oak_log");

    await emitter.resolver(context).extract(acceptor);

    expect(
      acceptor.jsonAt("data/minecraft/tags/blocks/oak_logs.json"),
    ).toMatchSnapshot("#oak_logs content");
  });

  it("removes tag entries using tag", async () => {
    const acceptor = createTestAcceptor();

    emitter.blocks.remove("#minecraft:mineable/axe", "#minecraft:logs");
    emitter.blocks.remove(
      "#minecraft:guarded_by_piglins",
      "#minecraft:mineable/axe",
    );
    emitter.blocks.remove(
      "#minecraft:guarded_by_piglins",
      "#minecraft:mineable/pickaxe",
    );

    await emitter.resolver(context).extract(acceptor);

    expect(
      acceptor.jsonAt("data/minecraft/tags/blocks/mineable/axe.json"),
    ).toMatchSnapshot("modified #minable/axe");
    expect(
      acceptor.jsonAt("data/minecraft/tags/blocks/guarded_by_piglins.json"),
    ).toMatchSnapshot("modified #guarded_by_piglins");
  });

  it("removes tag entries using regex", async () => {
    const acceptor = createTestAcceptor();

    emitter.blocks.remove("#minecraft:birch_logs", /minecraft:stripped_.+/);

    await emitter.resolver(context).extract(acceptor);

    expect(
      acceptor.jsonAt("data/minecraft/tags/blocks/birch_logs.json"),
    ).toMatchSnapshot("modified #birch_logs");
  });

  it("removes tag entries using predicate", async () => {
    const acceptor = createTestAcceptor();

    emitter.blocks.remove("#minecraft:guarded_by_piglins", (it) =>
      it.includes("gold"),
    );

    await emitter.resolver(context).extract(acceptor);

    expect(
      acceptor.jsonAt("data/minecraft/tags/blocks/guarded_by_piglins.json"),
    ).toMatchSnapshot("modified #guarded_by_piglins");
  });
});
