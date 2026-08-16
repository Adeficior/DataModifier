import { provided } from "@adeficior/testing";
import { describe, expect, it } from "bun:test";
import { basename } from "node:path";
import { setupRecipeSerializer } from "../../src/testing";
import { recipes } from "../providers/recipes";

const version = basename(import.meta.dir);
const { serializer } = setupRecipeSerializer(version);

describe("recipe serializer", () => {
  it("throws an exception for unknown recipe types", async () => {
    expect(() => {
      serializer.deserialize({
        type: "example:unknown",
      });
    }).toThrow("no serializer registered ");
  });
});

describe("recipe serializer", () => {
  provided(
    "can deserialize recipes it serialized itself",
    recipes(),
    async (type, recipe) => {
      const serialized = serializer.serialize(type, recipe);
      const deserialized = serializer.deserialize(serialized);

      expect(deserialized.recipe).toMatchObject(recipe);
    },
  );
});
