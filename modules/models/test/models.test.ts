import { type LoaderContext } from "@adeficior/data-modifier-core";
import {
  createTestAcceptor,
  createTestLogger,
} from "@adeficior/pack-resolver/testing";
import { afterEach, describe, expect, it } from "bun:test";
import { type Model } from "../src";
import { ModelEmitter } from "../src/emitter/models";

// TODO more tests

const context: LoaderContext = { logger: createTestLogger() };
const emitter = new ModelEmitter("custom");

afterEach(() => {
  emitter.clear();
});

describe("models", () => {
  it("creates custom model", async () => {
    const acceptor = createTestAcceptor();

    const model: Model = {
      parent: "something",
    };
    emitter.add("example:test", model);

    await emitter.resolver(context).extract(acceptor);

    expect(
      acceptor.jsonAt("assets/example/models/custom/test.json"),
    ).toMatchObject(model);
  });
});
