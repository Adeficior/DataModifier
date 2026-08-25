import type { LoaderContext } from "@adeficior/data-modifier-core";
import {
  createTestAcceptor,
  createTestLogger,
} from "@adeficior/pack-resolver/testing";
import { createTestDataResolver } from "@adeficior/testing";
import { afterEach, beforeAll, describe, expect, it } from "bun:test";
import { langFolder } from "../src";
import { LangEmitterImpl } from "../src/emitter";
import { LangLoaderImpl } from "../src/loader";

const version = "1.20.1";
const context: LoaderContext = { logger: createTestLogger() };
const loader = new LangLoaderImpl(langFolder());
const emitter = new LangEmitterImpl(loader);

beforeAll(async () => {
  const resolver = await createTestDataResolver(version, {
    include: "assets/*/lang/en_us.json",
    from: ["default", "create", "farmersdelight"],
  });
  await resolver.extract(loader);
});

afterEach(() => {
  emitter.clear();
});

describe("replacing translation entries", () => {
  it("replaces using string value", async () => {
    const acceptor = createTestAcceptor();

    emitter.replaceValue("diorite", "bird poop", { lang: "en_us" });

    await emitter.resolver(context).extract(acceptor);

    expect(acceptor.jsonAt("assets/minecraft/lang/en_us.json")).toMatchSnapshot(
      "replaced diorite values",
    );
  });

  it("replaces requires the case to match", async () => {
    const acceptor = createTestAcceptor();

    emitter.replaceValue("Stone", "rock", {
      lang: "en_us",
      matchCase: true,
    });

    await emitter.resolver(context).extract(acceptor);

    expect(acceptor.jsonAt("assets/minecraft/lang/en_us.json")).toMatchSnapshot(
      "replaced matched case values",
    );
  });

  it("emits custom values", async () => {
    const acceptor = createTestAcceptor();

    emitter.addCustom("en_us", "something.else", "The Value");
    emitter.entryName("minecraft:item", "minecraft:diamond", "Sapphire");

    await emitter.resolver(context).extract(acceptor);

    expect(acceptor.jsonAt("assets/minecraft/lang/en_us.json")).toMatchSnapshot(
      "custom values",
    );
  });

  it("emits custom values together with replaced values", async () => {
    const acceptor = createTestAcceptor();

    emitter.addCustom("en_us", "something.else", "The Value");
    emitter.entryName("minecraft:item", "minecraft:diamond", "Sapphire");
    emitter.replaceValue("Diamond", "ruby");

    await emitter.resolver(context).extract(acceptor);

    expect(acceptor.jsonAt("assets/minecraft/lang/en_us.json")).toMatchSnapshot(
      "custom values",
    );
  });

  it("only modifies values of given mods", async () => {
    const acceptor = createTestAcceptor();

    emitter.replaceValue("Iron", "Steel", {
      lang: "en_us",
      namespaces: ["create", "farmersdelight"],
    });

    await emitter.resolver(context).extract(acceptor);

    expect(acceptor.paths()).toHaveLength(2);
  });

  it("respects keepCase option", async () => {
    const acceptor = createTestAcceptor();

    emitter.replaceValue("Dark Oak", "Mahogony", {
      lang: "en_us",
      namespaces: ["minecraft"],
      keepCase: false,
    });

    await emitter.resolver(context).extract(acceptor);

    expect(acceptor.jsonAt("assets/minecraft/lang/en_us.json")).toMatchSnapshot(
      "kept case values",
    );
  });
});
