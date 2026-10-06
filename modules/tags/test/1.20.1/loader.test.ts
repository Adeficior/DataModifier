import { createTestDataResolver, setupLookup } from "@adeficior/testing";
import { beforeAll, describe, expect, it } from "bun:test";
import { basename } from "node:path";
import { TagsLoader } from "../../src/loader";

const version = basename(import.meta.dir);
const lookup = setupLookup(version);
const loader = new TagsLoader(lookup);

const itemTags = loader.registry("item");
const blockTags = loader.registry("block");

beforeAll(async () => {
  const resolver = await createTestDataResolver(version, {
    include: "data/*/tags/**/*.json",
  });
  await resolver.extract(loader);
});

describe("loading of tags", () => {
  it("loads tags correctly", async () => {
    expect(blockTags.list().toArray().length).toBe(271);
    expect(itemTags.list().toArray().length).toBe(269);

    expect(blockTags.get("#minecraft:mineable/pickaxe")).toMatchSnapshot(
      "#mineable/pickaxe content",
    );
    expect(itemTags.get("#minecraft:logs")).toMatchSnapshot("#logs content");
  });

  it("resolves tags correctly", async () => {
    expect(blockTags.resolve("#minecraft:mineable/axe")).toMatchSnapshot(
      "resolved #mineable/axe entries",
    );
    expect(itemTags.resolve("#minecraft:trapdoors")).toMatchSnapshot(
      "resolved #trapdoors entries",
    );
  });
});

describe("tag contain tests", () => {
  it("finds item in tag", async () => {
    expect(
      blockTags.contains("#minecraft:mineable/axe", "minecraft:note_block"),
    ).toBeTruthy();
    expect(
      blockTags.contains("#minecraft:mineable/axe", "minecraft:oak_log"),
    ).toBeTruthy();
    expect(
      blockTags.contains(
        "#minecraft:mineable/axe",
        "minecraft:stripped_oak_log",
      ),
    ).toBeTruthy();
    expect(
      blockTags.contains("#minecraft:mineable/axe", "minecraft:chest"),
    ).toBeTruthy();

    expect(
      blockTags.contains("#minecraft:mineable/axe", "minecraft:stone"),
    ).toBeFalsy();
  });

  it("finds tag in tag", async () => {
    expect(
      blockTags.contains("#minecraft:mineable/axe", "#minecraft:logs"),
    ).toBeTruthy();
    expect(
      blockTags.contains(
        "#minecraft:mineable/axe",
        "#minecraft:logs_that_burn",
      ),
    ).toBeTruthy();

    expect(
      blockTags.contains("#minecraft:mineable/axe", "#minecraft:trapdoors"),
    ).toBeFalsy();
  });
});
