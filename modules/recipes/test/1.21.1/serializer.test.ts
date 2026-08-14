import { describe, expect, it } from "bun:test";
import { basename } from "node:path";
import { setupRecipeSerializer } from "../../src/testing";

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
