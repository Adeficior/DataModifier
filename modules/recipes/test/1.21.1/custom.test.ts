import type { Id } from "@adeficior/data-modifier-core";
import { packFormatOf } from "@adeficior/data-modifier-core";
import { createTestAcceptor } from "@adeficior/pack-resolver/testing";
import { provided } from "@adeficior/testing";
import { describe, expect } from "bun:test";
import { basename } from "node:path";
import { recipePath } from "../../src";
import { setupRecipeEmitter } from "../../src/testing";
import { recipes } from "../providers/recipes";

const version = basename(import.meta.dir);
const { emitter, resolver } = setupRecipeEmitter(version);

describe("custom recipe creation", () => {
  provided("creates using recipe classes", recipes(), async (type, recipe) => {
    const acceptor = createTestAcceptor();
    const id: Id = { namespace: "test", path: "example" };

    emitter.add(id, type, recipe);

    await resolver.extract(acceptor);

    expect(
      acceptor.jsonAt(recipePath(packFormatOf(version), id)),
    ).toMatchSnapshot("serialized");
  });
});
