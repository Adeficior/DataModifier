import { beforeEach, describe, expect, it } from "bun:test";
import {
  BlockIngredient,
  FluidIngredient,
  ItemIngredient,
} from "../src/common/ingredient/index.js";
import { FluidResult, ItemResult } from "../src/common/result/index.js";
import setupLoader from "./shared/loaderSetup.js";

const version = "1.20.1";
const { logger, loader, loadDump } = setupLoader({ version, load: false });

beforeEach(loadDump);

describe("registry dump tests", () => {
  it("correctly loads imports registries", async () => {
    expect(logger.warn).not.toHaveBeenCalled();
    expect(loader.registries.keys("fluid")).toMatchSnapshot(
      "dumped fluid registry entries",
    );
  });

  it("warns about unknown registries", async () => {
    loader.registries.keys("example");

    expect(logger.warn).toHaveBeenCalledWith(
      "tried to access registry 'minecraft:example', which has not been loaded",
    );
  });

  it("validates correct ingredients", async () => {
    loader.createIngredient("minecraft:stone");
    loader.createIngredient(new ItemIngredient("minecraft:stone"));
    loader.createResult("minecraft:stick");
    loader.createResult(new ItemResult("minecraft:stick"));
    loader.createIngredient(new BlockIngredient("minecraft:obsidian"));
    loader.createResult(new FluidResult("minecraft:water"));

    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("validates incorrect ingredients", async () => {
    expect(() => loader.createIngredient("example:unknown")).toThrow(
      "unknown minecraft:item 'example:unknown'",
    );

    expect(() =>
      loader.createResult(new ItemResult("minecraft:kitkat")),
    ).toThrow("unknown minecraft:item 'minecraft:kitkat'");

    expect(() =>
      loader.createIngredient(new BlockIngredient("something")),
    ).toThrow("unknown minecraft:block 'minecraft:something'");

    expect(() => loader.createResult(new FluidResult("whatever"))).toThrow(
      "unknown minecraft:fluid 'minecraft:whatever'",
    );

    expect(() =>
      loader.createIngredient([
        "minecraft:stone",
        new FluidIngredient("no-idea"),
      ]),
    ).toThrow("unknown minecraft:fluid 'minecraft:no-idea'");
  });

  it("recipe replacement validates incorrect ingredients", async () => {
    expect(() => {
      loader.recipes.replaceIngredient(
        "minecraft:emerald",
        new ItemIngredient("minecraft:ruby"),
      );
    }).toThrow("unknown minecraft:item 'minecraft:ruby'");

    expect(() => {
      loader.recipes.replaceIngredient(
        "minecraft:ruby",
        new ItemIngredient("minecraft:lapis_lazuli"),
      );
    }).toThrow("unknown minecraft:item 'minecraft:ruby'");

    expect(() => {
      loader.recipes.replaceResult(
        "minecraft:diamond_block",
        new ItemResult("minecraft:coal_block"),
        { input: "minecraft:ruby" },
      );
    }).toThrow("unknown minecraft:item 'minecraft:ruby'");
  });

  it("loot replacement validates incorrect ingredients", async () => {
    expect(() => {
      loader.loot.replaceOutput(
        "minecraft:emerald",
        new ItemIngredient("minecraft:ruby"),
      );
    }).toThrow("unknown minecraft:item 'minecraft:ruby'");

    expect(() => {
      loader.loot.replaceOutput(
        "minecraft:ruby",
        new ItemIngredient("minecraft:lapis_lazuli"),
      );
    }).toThrow("unknown minecraft:item 'minecraft:ruby'");

    expect(() => {
      loader.loot.replaceOutput(
        "minecraft:diamond_block",
        new ItemIngredient("minecraft:coal_block"),
        { output: "minecraft:ruby" },
      );
    }).toThrow("unknown minecraft:item 'minecraft:ruby'");

    expect(() => {
      loader.loot.removeOutput("minecraft:diamond_block", {
        output: "minecraft:ruby",
      });
    }).toThrow("unknown minecraft:item 'minecraft:ruby'");

    expect(() => {
      loader.loot.disable({ output: "minecraft:ruby_block" });
    }).toThrow("unknown minecraft:item 'minecraft:ruby_block'");
  });
});
