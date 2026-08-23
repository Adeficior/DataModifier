import { defineModule } from "@adeficior/data-modifier-core";
import {
  BlockIngredient,
  FluidIngredient,
  ItemIngredient,
} from "@adeficior/data-modifier-ingredients";
import { createTestAcceptor } from "@adeficior/pack-resolver/testing";
import { createDumpResolver } from "@adeficior/testing";
import { describe, expect, it } from "bun:test";
import type { BlacklistEmitter, BlacklistOptions } from "../src/emit/blacklist";
import { BlacklistEmitterImpl } from "../src/emit/blacklist";
import { setupInstance } from "./util/setup";

const module = defineModule<{
  options: BlacklistOptions;
  emitters: {
    blacklist: BlacklistEmitter;
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
        new BlacklistEmitterImpl(
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
    modules.install(module, { hideFrom: ["polytone"] });
  },
);

const blacklist = instance.get<BlacklistEmitter>("emitter:blacklist");

describe("blacklist tests", () => {
  it("does not generate a jei blacklist config file", async () => {
    const acceptor = createTestAcceptor();

    blacklist.hide("minecraft:stone");

    await instance.emit(acceptor);

    expect(acceptor.at("jei/blacklist.cfg")).toBeNull();
  });

  it("does not create the jei blacklist config if nothing is hidden", async () => {
    const acceptor = createTestAcceptor();

    blacklist.hide("minecraft:stone");
    blacklist.hide(new FluidIngredient("water"));
    blacklist.hide(new BlockIngredient("water"));
    blacklist.hide([
      new ItemIngredient("ice"),
      new FluidIngredient("minecraft:lava"),
    ]);

    await instance.emit(acceptor);

    expect(
      acceptor.at(
        "assets/generated/polytone/creative_tab_modifiers/hidden.json",
      ),
    ).toMatchSnapshot("creates a polytone tab modifier");
  });
});
