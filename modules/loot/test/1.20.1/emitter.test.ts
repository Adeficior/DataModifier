import {
  ItemIngredient,
  ItemResult,
  ItemTagIngredient,
} from "@adeficior/data-modifier-ingredients";
import { createTestAcceptor } from "@adeficior/pack-resolver/testing";
import { describe, expect, it } from "bun:test";
import { basename } from "node:path";
import { EMPTY_LOOT_TABLE } from "../../src/emitter";
import { LootTableSchema, parseLootEntry } from "../../src/schema";
import { setupLootEmitter } from "../../src/testing";

const version = basename(import.meta.dir);
const { emitter, resolver } = setupLootEmitter(version, {
  from: ["default", "farmersdelight"],
});

describe("loot tables output replacements", () => {
  it("removes outputs", async () => {
    const acceptor = createTestAcceptor();

    emitter.removeOutput("#minecraft:iron_ores");

    await resolver.extract(acceptor);

    expect(
      acceptor.jsonAt("data/minecraft/loot_tables/blocks/iron_ore.json"),
    ).toMatchSnapshot("modified deepslate_iron_ore loot table");
    expect(
      acceptor.jsonAt(
        "data/minecraft/loot_tables/blocks/deepslate_iron_ore.json",
      ),
    ).toMatchSnapshot("modified iron_ore loot table");
  });

  it("replaces outputs with additional tests", async () => {
    const acceptor = createTestAcceptor();

    emitter.replaceOutput(
      "#forge:ingots/iron",
      new ItemTagIngredient("forge:ingots/lead"),
      { id: /minecraft:entities\/.+/ },
    );
    emitter.replaceOutput(
      new ItemIngredient("minecraft:rotten_flesh"),
      new ItemIngredient("minecraft:sand"),
      { id: "minecraft:entities/husk" },
    );

    await resolver.extract(acceptor);

    expect(
      acceptor.jsonAt("data/minecraft/loot_tables/entities/husk.json"),
    ).toMatchSnapshot("modified husk loot table");
    expect(
      acceptor.jsonAt("data/minecraft/loot_tables/entities/iron_golem.json"),
    ).toMatchSnapshot("modified iron_golem loot table");
    expect(
      acceptor.jsonAt("data/minecraft/loot_tables/entities/zombie.json"),
    ).toMatchSnapshot("modified zombie loot table");
    expect(
      acceptor.jsonAt(
        "data/minecraft/loot_tables/entities/zombie_villager.json",
      ),
    ).toMatchSnapshot("modified zombie_villager loot table");
  });

  it("keeps extended loot entry properties", async () => {
    const acceptor = createTestAcceptor();

    emitter.replaceOutput(
      "farmersdelight:rice",
      new ItemResult("minecraft:apple"),
    );

    await resolver.extract(acceptor);

    expect(
      acceptor.jsonAt("data/farmersdelight/loot_tables/blocks/wild_rice.json"),
    ).toMatchSnapshot("modified wild rice loot table");
  });
});

describe("loot table removal", () => {
  it("removes loot table with id filter", async () => {
    const acceptor = createTestAcceptor();

    emitter.disable({
      id: /minecraft:.*oak_log/,
    });

    await resolver.extract(acceptor);

    expect(
      acceptor.jsonAt("data/minecraft/loot_tables/blocks/oak_log.json"),
    ).toMatchObject(EMPTY_LOOT_TABLE);
    expect(
      acceptor.jsonAt(
        "data/minecraft/loot_tables/blocks/stripped_oak_log.json",
      ),
    ).toMatchObject(EMPTY_LOOT_TABLE);
    expect(
      acceptor.jsonAt("data/minecraft/loot_tables/blocks/dark_oak_log.json"),
    ).toMatchObject(EMPTY_LOOT_TABLE);
    expect(
      acceptor.jsonAt(
        "data/minecraft/loot_tables/blocks/stripped_dark_oak_log.json",
      ),
    ).toMatchObject(EMPTY_LOOT_TABLE);
  });

  it("removes loot table with output filter", async () => {
    const acceptor = createTestAcceptor();

    emitter.disable({
      output: "#minecraft:logs",
    });

    await resolver.extract(acceptor);

    expect(acceptor.paths()).toMatchSnapshot("loot tables containing any log");
  });
});

it("creates custom loot tables", async () => {
  const acceptor = createTestAcceptor();

  const lootTable = LootTableSchema.parse({
    type: "minecraft:block",
    pools: [
      {
        rolls: 4,
        entries: [
          parseLootEntry({
            type: "minecraft:alternatives",
            children: [
              parseLootEntry({
                type: "minecraft:item",
                name: "minecraft:diamond",
              }),
            ],
          }),
          parseLootEntry({
            type: "minecraft:tag",
            name: "minecraft:logs",
          }),
        ],
      },
    ],
  });

  emitter.add("example:custom", lootTable);

  await resolver.extract(acceptor);

  expect(
    acceptor.jsonAt("data/example/loot_tables/custom.json"),
  ).toMatchSnapshot("parsed loot table");
  expect(acceptor.jsonAt("data/example/loot_tables/custom.json")).toMatchObject(
    lootTable,
  );
});
