import { expect, it } from "bun:test";
import type { Id } from "../src";
import { Registry, createId, encodeId } from "../src";

it("parses id from string", () => {
  expect(createId("minecraft:stone")).toMatchObject({
    namespace: "minecraft",
    path: "stone",
  });
  expect(createId("dirt")).toMatchObject({
    namespace: "minecraft",
    path: "dirt",
  });
  expect(createId("minecraft:with/path")).toMatchObject({
    namespace: "minecraft",
    path: "with/path",
  });
  expect(createId("example:custom")).toMatchObject({
    namespace: "example",
    path: "custom",
  });
});

it("parses id from tag", () => {
  expect(createId("#minecraft:planks")).toMatchObject({
    namespace: "minecraft",
    path: "planks",
    isTag: true,
  });
  expect(createId("#logs")).toMatchObject({
    namespace: "minecraft",
    path: "logs",
    isTag: true,
  });
  expect(createId("#minecraft:nested/tag")).toMatchObject({
    namespace: "minecraft",
    path: "nested/tag",
    isTag: true,
  });
});

it("accepts id object", () => {
  const id: Id = { namespace: "minecraft", path: "the/id" };
  expect(createId(id)).toMatchObject(id);
});

it("encodes id correctly", () => {
  expect(encodeId("#minecraft:planks")).toBe("#minecraft:planks");
  expect(encodeId("#mineable/axe")).toBe("#minecraft:mineable/axe");
  expect(encodeId("#mineable/axe")).toBe("#minecraft:mineable/axe");
  expect(encodeId({ namespace: "minecraft", path: "fire" })).toBe(
    "minecraft:fire",
  );
  expect(
    encodeId({ namespace: "minecraft", path: "pickaxes", isTag: true }),
  ).toBe("#minecraft:pickaxes");
});

it("works as unique map key", () => {
  const map = new Registry<number>();

  map.set({ namespace: "minecraft", path: "air" }, 1);
  map.set({ namespace: "minecraft", path: "dirt" }, 2);
  map.set({ namespace: "minecraft", path: "fire" }, 3);
  map.set({ namespace: "minecraft", path: "water" }, 4);
  map.set({ namespace: "minecraft", path: "tag", isTag: true }, 5);

  expect(map.get({ namespace: "minecraft", path: "air" })).toEqual(1);
  expect(map.get({ namespace: "minecraft", path: "dirt" })).toEqual(2);
  expect(map.get({ namespace: "minecraft", path: "fire" })).toEqual(3);
  expect(map.get({ namespace: "minecraft", path: "water" })).toEqual(4);
  expect(map.get("#minecraft:tag")).toEqual(5);
});
