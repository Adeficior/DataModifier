import type { NormalizedId } from "@adeficior/data-modifier-core";
import { UnknownRegistryEntry } from "@adeficior/data-modifier-core/serializer";
import { setupLookup } from "@adeficior/testing";
import { describe, expect, it } from "bun:test";
import { resolveIdFilter } from "../src";
import type { IdFilterContext } from "../src";

const lookup = setupLookup("1.21.1");

describe("ID filters", () => {
  it("correctly tests id using string", () => {
    const predicate = resolveIdFilter<NormalizedId>("minecraft:stone");

    expect(predicate({ namespace: "minecraft", path: "stone" })).toBeTruthy();
    expect(predicate("minecraft:stone")).toBeTruthy();

    expect(predicate({ namespace: "minecraft", path: "planks" })).toBeFalsy();
    expect(predicate("minecraft:end_stone")).toBeFalsy();
    expect(predicate("example:stone")).toBeFalsy();
  });

  it("correctly tests id using regex", () => {
    const predicate = resolveIdFilter(/.+:oak_.+/);

    expect(
      predicate({ namespace: "minecraft", path: "oak_planks" }),
    ).toBeTruthy();
    expect(predicate("minecraft:oak_log")).toBeTruthy();
    expect(predicate("something:oak_quibbels")).toBeTruthy();

    expect(predicate({ namespace: "example", path: "spruce_log" })).toBeFalsy();
    expect(predicate("minecraft:stripped_oak_log")).toBeFalsy();
  });

  it("correctly tests id using predicate", () => {
    const predicate = resolveIdFilter((it) => it.includes("one"));

    expect(predicate({ namespace: "minecraft", path: "stone" })).toBeTruthy();
    expect(predicate("minecraft:bone_block")).toBeTruthy();
    expect(predicate("something:kwoner")).toBeTruthy();
    expect(predicate("one:two")).toBeTruthy();

    expect(predicate({ namespace: "example", path: "spruce_log" })).toBeFalsy();
    expect(predicate("minecraft:andesite")).toBeFalsy();
  });

  it("validates given IDs", () => {
    const context: IdFilterContext = { lookup, registry: "minecraft:item" };

    resolveIdFilter("minecraft:apple", context);

    expect(() => {
      resolveIdFilter("minecraft:unknown", context);
    }).toThrow(UnknownRegistryEntry);
  });
});
