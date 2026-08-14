import { defineModule } from "@adeficior/data-modifier-core";
import type { Ingredient } from "@adeficior/data-modifier-ingredients";
import {
  BlockIngredient,
  FluidIngredient,
  ItemIngredient,
} from "@adeficior/data-modifier-ingredients";
import { createTestAcceptor } from "@adeficior/pack-resolver/testing";
import { createDumpResolver } from "@adeficior/testing";
import { describe, expect, it } from "bun:test";
import { BlacklistEmitter } from "../src/emit/blacklist";
import type { BlacklistOptions, BlacklistRules } from "../src/emit/blacklist";
import { setupInstance } from "./util/setup";

const module = defineModule<{
  options: BlacklistOptions;
  emitters: {
    blacklist: BlacklistRules;
  };
}>({
  name: "internal",
  dependencies: {
    "@adeficior/data-modifier-ingredients": "required",
  },
  setup: (pack) => {
    pack.emitter(
      "blacklist",
      (container) =>
        new BlacklistEmitter(
          container.get("registries"),
          container.get("predicates"),
          container.get("serializer:ingredients"),
          pack.options,
        ),
    );
  },
});

const version = "1.20.1";
const instance = await setupInstance(
  version,
  {
    load: false,
    dump: await createDumpResolver(version),
  },
  (modules) => {
    modules.install(module, { hideFrom: ["jei"] });
  },
);

const blacklist = instance.get<BlacklistRules>("emitter:blacklist");

describe("blacklist tests", () => {
  it("generated a jei blacklist config file", async () => {
    const acceptor = createTestAcceptor();

    blacklist.hide("minecraft:stone");
    blacklist.hide(new FluidIngredient("water"));
    blacklist.hide(new BlockIngredient("water"));
    blacklist.hide([
      new ItemIngredient("ice"),
      new FluidIngredient("minecraft:lava"),
    ]);

    await instance.emit(acceptor);

    expect(acceptor.at("jei/blacklist.cfg")).toMatchSnapshot(
      "jei blacklist config file",
    );
  });

  it("does not create the jei blacklist config if nothing is hidden", async () => {
    const acceptor = createTestAcceptor();

    await instance.emit(acceptor);

    expect(acceptor.at("jei/blacklist.cfg")).toBeNull();
  });

  it("generated a blacklist using dumped ids", async () => {
    const acceptor = createTestAcceptor();

    blacklist.hide(/minecraft:.*oak.*/);
    blacklist.hide(
      (it: Ingredient) =>
        it instanceof ItemIngredient && it.id.includes("granite"),
    );

    await instance.emit(acceptor);

    expect(acceptor.at("jei/blacklist.cfg")).toMatchSnapshot(
      "jei blacklist config file using registry dump",
    );
  });

  // move to seperate test after extracting into module
  it.skip("fails when trying to use a regex/predicate without a registry dump", async () => {
    const acceptor = createTestAcceptor();

    const message =
      "you can only use regex/predicates to blacklist items if a registry dump is loaded";
    expect(() => blacklist.hide(/whatever/)).toThrow(message);
    expect(() => blacklist.hide(() => true)).toThrow(message);

    await instance.emit(acceptor);

    expect(acceptor.at("jei/blacklist.cfg")).toBeNull();
  });

  it("validates custom registry ids", async () => {
    const acceptor = createTestAcceptor();

    expect(() => blacklist.hideEntry("example", /whatever/)).toThrow(
      `cannot hide using regex/predicates, registry minecraft:example not loaded`,
    );
    blacklist.hideEntry("minecraft:worldgen/biome", "minecraft:basalt_deltas");
    blacklist.hideEntry("minecraft:worldgen/biome", /minecraft:.+_forest/);

    await instance.emit(acceptor);

    expect(acceptor.at("jei/blacklist.cfg")).toMatchSnapshot(
      "jei blacklist config file using biome registry",
    );
  });
});
