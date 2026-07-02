import { createTestAcceptor } from "@adeficior/pack-resolver/testing";
import { beforeEach, describe, expect, it } from "bun:test";
import {
  BlockIngredient,
  FluidIngredient,
  ItemIngredient,
} from "../src/common/ingredient/index.js";
import setupLoader from "./shared/loaderSetup.js";

const version = "1.20.1";
const { loader, loadDump } = setupLoader({
  version,
  load: false,
  hideFrom: ["polytone"],
});

beforeEach(loadDump);

describe("blacklist tests", () => {
  it("does not generate a jei blacklist config file", async () => {
    const acceptor = createTestAcceptor();

    loader.blacklist.hide("minecraft:stone");

    await loader.emit(acceptor);

    expect(acceptor.at("jei/blacklist.cfg")).toBeNull();
  });

  it("does not create the jei blacklist config if nothing is hidden", async () => {
    const acceptor = createTestAcceptor();

    loader.blacklist.hide("minecraft:stone");
    loader.blacklist.hide(new FluidIngredient("water"));
    loader.blacklist.hide(new BlockIngredient("water"));
    loader.blacklist.hide([
      new ItemIngredient("ice"),
      new FluidIngredient("minecraft:lava"),
    ]);

    await loader.emit(acceptor);

    expect(
      acceptor.at(
        "assets/generated/polytone/creative_tab_modifiers/hidden.json",
      ),
    ).toMatchSnapshot("creates a polytone tab modifier");
  });
});
