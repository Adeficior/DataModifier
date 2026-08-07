import { combineResolvers } from "@adeficior/pack-resolver";
import {
  createTestAcceptor,
  createTestLogger,
  createTestResolver,
} from "@adeficior/pack-resolver/testing";
import { describe, expect, it } from "bun:test";
import {
  overwritePackMetadata,
  type PackMetadata,
} from "../src/emit/packMetadata";

describe("pack.mcmeta tests", () => {
  it("overwrites existing pack.mcmeta files", async () => {
    const resolver = combineResolvers([
      createTestResolver({
        "pack.mcmeta": "metadata 1",
      }),
      createTestResolver({
        "pack.mcmeta": "metadata 2",
      }),
    ]);

    const acceptor = createTestAcceptor();

    const expected: PackMetadata = {
      pack: { pack_format: 31, description: "test description" },
    };

    const withMetadata = overwritePackMetadata(resolver, {
      packFormat: "31.1",
      logger: createTestLogger(),
      description: "test description",
    });

    await withMetadata.extract(acceptor);

    expect(acceptor.jsonAt("pack.mcmeta")).toMatchObject(expected);
  });
});
