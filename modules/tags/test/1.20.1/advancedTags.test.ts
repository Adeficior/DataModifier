import type { LoaderContext } from "@adeficior/data-modifier-core";
import { packFormatOf } from "@adeficior/data-modifier-core";
import {
  createTestAcceptor,
  createTestLogger,
} from "@adeficior/pack-resolver/testing";
import { setupLookup } from "@adeficior/testing";
import { afterEach, describe, expect, it } from "bun:test";
import { basename } from "node:path";
import { TagEmitterImpl } from "../../src/emitter";
import { TagsLoader } from "../../src/loader";

const version = basename(import.meta.dir);
const context: LoaderContext = { logger: createTestLogger() };
const loader = new TagsLoader(packFormatOf(version));
const lookup = setupLookup(version);
const emitter = new TagEmitterImpl(loader, lookup, { advancedTags: true });

afterEach(() => {
  emitter.clear();
});

describe("creation of tag definitions for the advanced tag-loader mod", () => {
  it("can generate files using remove entries", async () => {
    const acceptor = createTestAcceptor();

    emitter.blocks.add("#minecraft:fire_resistant_logs", "#minecraft:logs");
    emitter.blocks.remove(
      "#minecraft:fire_resistant_logs",
      "#minecraft:logs_that_burn",
    );

    await emitter.resolver(context).extract(acceptor);

    expect(
      acceptor.jsonAt("data/minecraft/tags/blocks/fire_resistant_logs.json"),
    ).toMatchSnapshot("created #minecraft:fire_resistant_logs");
  });

  it("fails when trying to remove using predicates", () => {
    const message = "advanced tag loader only accepts tag entries in removal";

    expect(() => {
      emitter.blocks.remove("#minecraft:fire_resistant_logs", () => true);
    }).toThrow(message);

    expect(() => {
      emitter.blocks.remove("#minecraft:fire_resistant_logs", /regex/);
    }).toThrow(message);
  });
});
