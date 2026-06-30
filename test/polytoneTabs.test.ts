import { createTestAcceptor } from "@adeficior/pack-resolver/testing";
import { describe, expect, it } from "bun:test";
import { encodeId } from "../src/index.js";
import setupLoader from "./shared/loaderSetup.js";

const version = "1.20.1";
const { loader } = setupLoader({
  version,
  load: false,
  hideFrom: ["polytone"],
});

describe("creates addition entries", () => {
  it("emits per tab key", async () => {
    const acceptor = createTestAcceptor();

    loader.tabs.add(
      ["something:test_tab", { namespace: "example", path: "food" }],
      ["minecraft:diamond", { namespace: "forge", path: "the_logo" }],
    );

    await loader.resolver.extract(acceptor);

    expect(
      acceptor.at(
        "assets/something/polytone/creative_tab_modifiers/test_tab.json",
      ),
    ).toMatchSnapshot("addition modifier 2");
    expect(
      acceptor.at("assets/example/polytone/creative_tab_modifiers/food.json"),
    ).toMatchSnapshot("addition modifier 1");
  });

  it("adds after predicate", async () => {
    const acceptor = createTestAcceptor();

    loader.tabs.add("example:tab", ["minecraft:oak_log"], {
      after: "minecraft:stone_axe",
    });

    await loader.resolver.extract(acceptor);

    expect(
      acceptor.at("assets/example/polytone/creative_tab_modifiers/tab.json"),
    ).toMatchSnapshot("addition modifier with after predicate");
  });

  it("adds before predicate", async () => {
    const acceptor = createTestAcceptor();

    loader.tabs.add("example:tab", ["minecraft:oak_planks"], {
      before: "minecraft:stone_hoe",
    });

    await loader.resolver.extract(acceptor);

    expect(
      acceptor.at("assets/example/polytone/creative_tab_modifiers/tab.json"),
    ).toMatchSnapshot("addition modifier with after predicate");
  });

  it("uses custom file name", async () => {
    const acceptor = createTestAcceptor();

    loader.tabs.add("something:test_tab", ["minecraft:diamond"], {
      file: "other:id",
    });

    await loader.resolver.extract(acceptor);

    expect(
      acceptor.at(
        "assets/something/polytone/creative_tab_modifiers/test_tab.json",
      ),
    ).toBeNull();
    expect(
      acceptor.at("assets/other/polytone/creative_tab_modifiers/id.json"),
    ).toMatchSnapshot("removal modifier with custom file name");
  });

  it("fails trying to merge modifiers with different targets", () => {
    loader.tabs.add("something:test_tab", ["minecraft:diamond"], {
      file: "other:id",
    });

    expect(() =>
      loader.tabs.add(
        "something:another_tab",
        ["minecraft:diamond_chestplate"],
        { file: "other:id" },
      ),
    ).toThrow("trying to merge modifiers with different targets");
  });
});

describe("create removal entries", () => {
  it("resolves filter correctly", async () => {
    const acceptor = createTestAcceptor();

    loader.tabs.remove(
      ["something:test_tab", { namespace: "example", path: "food" }],
      ["minecraft:diamond", { namespace: "forge", path: "the_logo" }],
    );

    await loader.resolver.extract(acceptor);

    expect(
      acceptor.at(
        "assets/something/polytone/creative_tab_modifiers/test_tab.json",
      ),
    ).toMatchSnapshot("removal modifier 2");
    expect(
      acceptor.at("assets/example/polytone/creative_tab_modifiers/food.json"),
    ).toMatchSnapshot("removal modifier 1");
  });

  it("uses custom file name", async () => {
    const acceptor = createTestAcceptor();

    loader.tabs.remove("something:test_tab", ["minecraft:diamond"], {
      file: "other:id",
    });

    await loader.resolver.extract(acceptor);

    expect(
      acceptor.at(
        "assets/something/polytone/creative_tab_modifiers/test_tab.json",
      ),
    ).toBeNull();
    expect(
      acceptor.at("assets/other/polytone/creative_tab_modifiers/id.json"),
    ).toMatchSnapshot("removal modifier with custom file name");
  });
});

describe("create new tabs", () => {
  it("emits and mergers csv", async () => {
    const acceptor = createTestAcceptor();

    const id = loader.tabs.create("something:test_tab");
    loader.tabs.create("something:another_tab");
    loader.tabs.create("minecraft:more_blocks");

    await loader.resolver.extract(acceptor);

    expect(encodeId(id)).toMatch("something:test_tab");
    expect(
      acceptor.at("assets/something/polytone/creative_tabs.csv"),
    ).toMatchSnapshot("tab csv 1 for something");
    expect(
      acceptor.at("assets/minecraft/polytone/creative_tabs.csv"),
    ).toMatchSnapshot("tab csv for minecraft");
  });
});
