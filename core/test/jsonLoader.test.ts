import { createTestResolver } from "@adeficior/pack-resolver/testing";
import { describe, expect, it } from "bun:test";
import * as z from "zod";
import { JsonLoader, withDisabledConditions, withModLoaded } from "../src";
import type { ConditionContext } from "../src";

const schema = z.object({ field: z.string() });
type Type = z.infer<typeof schema>;

class TestLoader extends JsonLoader<Type> {
  constructor(folder: string, context?: ConditionContext) {
    super({ packType: "data", folder }, context);
  }

  protected override parse(json: unknown) {
    return schema.parse(json);
  }
}

describe("JsonLoader", () => {
  it("loads resources in subfolders", async () => {
    const loader = new TestLoader("folder");

    const resolver = createTestResolver({
      "data/example/folder/test.json": `{ "field": "content" }`,
      "data/example/folder/nested/file.json": `{ "field": "nested" }`,
    });

    await resolver.extract(loader);

    expect(loader.get("example:test")).toMatchObject({ field: "content" });
    expect(loader.get("example:nested/file")).toMatchObject({
      field: "nested",
    });
  });

  it("skips disabled entries", async () => {
    const loader = new TestLoader("folder");

    const resolver = createTestResolver({
      "data/example/folder/test.json": JSON.stringify(
        withDisabledConditions<Type>({ field: "something" }),
      ),
    });

    await resolver.extract(loader);

    expect(loader.get("example:test")).toBeUndefined();
  });

  it("respects mod loaded conditions", async () => {
    const loader = new TestLoader("folder", { mods: ["known"] });

    const resolver = createTestResolver({
      "data/example/folder/unknown.json": JSON.stringify(
        withModLoaded<Type>({ field: "unknown mod" }, "unknown"),
      ),
      "data/example/folder/known.json": JSON.stringify(
        withModLoaded<Type>({ field: "known mod" }, "known"),
      ),
    });

    await resolver.extract(loader);

    expect(loader.get("example:unknown")).toBeUndefined();
    expect(loader.get("example:known")).toBeDefined();
  });

  it("works with multi-level registry folders", async () => {
    const loader = new TestLoader("the/registry");

    const resolver = createTestResolver({
      "data/example/the/registry/test.json": `{ "field": "content" }`,
      "data/example/the/registry/nested/file.json": `{ "field": "nested" }`,
    });

    await resolver.extract(loader);

    expect(loader.get("example:test")).toMatchObject({ field: "content" });
    expect(loader.get("example:nested/file")).toMatchObject({
      field: "nested",
    });
  });
});
