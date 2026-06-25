import { createTestAcceptor } from "@adeficior/pack-resolver/testing";
import { describe, expect, it } from "bun:test";
import type { Ingredient } from "../src/common/ingredient/index.js";
import {
  BlockIngredient,
  FluidIngredient,
  ItemIngredient,
} from "../src/common/ingredient/index.js";
import { encodeId } from "../src/index.js";
import setupLoader from "./shared/loaderSetup.js";

const version = "1.20.1";
const { loader, loadDump } = setupLoader({
  version,
  load: false,
  hideFrom: ["jei"],
});

describe("blacklist tests", () => {
  it("generated a jei blacklist config file", async () => {
    const acceptor = createTestAcceptor();

    loader.blacklist.hide("minecraft:stone");
    loader.blacklist.hide(new FluidIngredient("water"));
    loader.blacklist.hide(new BlockIngredient("water"));
    loader.blacklist.hide([
      new ItemIngredient("ice"),
      new FluidIngredient("forge:milk"),
    ]);

    await loader.emit(acceptor);

    expect(acceptor.at("jei/blacklist.cfg")).toMatchSnapshot(
      "jei blacklist config file",
    );
  });

  it("does not create the jei blacklist config if nothing is hidden", async () => {
    const acceptor = createTestAcceptor();

    await loader.emit(acceptor);

    expect(acceptor.at("jei/blacklist.cfg")).toBeNull();
  });

  it("generated a blacklist using dumped ids", async () => {
    const acceptor = createTestAcceptor();

    await loadDump();

    loader.blacklist.hide(/minecraft:.*oak.*/);
    loader.blacklist.hide(
      (it: Ingredient) =>
        // TODO id should already be a string
        it instanceof ItemIngredient && encodeId(it.id).includes("granite"),
    );

    await loader.emit(acceptor);

    expect(acceptor.at("jei/blacklist.cfg")).toMatchSnapshot(
      "jei blacklist config file using registry dump",
    );
  });

  it("fails when trying to use a regex/predicate without a registry dump", async () => {
    const acceptor = createTestAcceptor();

    const message =
      "you can only use regex/predicates to blacklist items if a registry dump is loaded";
    expect(() => loader.blacklist.hide(/whatever/)).toThrow(message);
    expect(() => loader.blacklist.hide(() => true)).toThrow(message);

    await loader.emit(acceptor);

    expect(acceptor.at("jei/blacklist.cfg")).toBeNull();
  });

  it("validates custom registry ids", async () => {
    const acceptor = createTestAcceptor();

    await loadDump();

    expect(() => loader.blacklist.hideEntry("example", /whatever/)).toThrow(
      `cannot hide using regex/predicates, registry minecraft:example not loaded`,
    );
    loader.blacklist.hideEntry(
      "minecraft:worldgen/biome",
      "minecraft:basalt_deltas",
    );
    loader.blacklist.hideEntry(
      "minecraft:worldgen/biome",
      /minecraft:.+_forest/,
    );

    await loader.emit(acceptor);

    expect(acceptor.at("jei/blacklist.cfg")).toMatchSnapshot(
      "jei blacklist config file using biome registry",
    );
  });
});
