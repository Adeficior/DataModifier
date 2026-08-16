import { setupRecipeSerializer } from "@adeficior/data-modifier-recipes/testing";
import { provided } from "@adeficior/testing";
import { describe, expect } from "bun:test";
import { basename } from "node:path";
import { registerSerializers } from "../../src/registration";
import { recipes } from "../providers/recipes";

const version = basename(import.meta.dir);
const { serializer } = setupRecipeSerializer(version, registerSerializers);

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
