import { encodeId } from "../common/id.js";
import {
  ItemIngredient,
  ItemTagIngredient,
  type Ingredient,
  type ItemLikeIngredient,
} from "../common/ingredient/index.js";
import type { Predicate } from "../common/predicates.js";
import { ItemResult } from "../common/result/index.js";
import type RegistryLookup from "../loader/registry/index.js";
import type {
  LootEntry,
  LootEntryBase,
  LootTable,
} from "../schema/data/loot.js";
import { extendLootEntry } from "../schema/data/loot.js";

export type LootItemInput = ItemLikeIngredient | ItemResult | LootEntry;

function createUnvalidatedLootEntry(input: LootItemInput): LootEntry {
  if (input instanceof ItemIngredient || input instanceof ItemResult) {
    return {
      type: "minecraft:item",
      name: encodeId(input.id),
    };
  }

  if (input instanceof ItemTagIngredient) {
    return {
      type: "minecraft:tag",
      name: encodeId(input.tag),
    };
  }

  return extendLootEntry(input);
}

function validateLootEntry(entry: LootEntry, lookup: RegistryLookup) {
  if (entry.type === "minecraft:item")
    lookup.validateEntry("minecraft:item", entry.name);
  if (entry.type === "minecraft:alternatives") {
    entry.children.forEach((it) =>
      validateLootEntry(extendLootEntry(it), lookup),
    );
  }
}

export function createLootEntry(
  input: LootItemInput,
  lookup: RegistryLookup,
): LootEntry {
  const unvalidated = createUnvalidatedLootEntry(input);
  validateLootEntry(unvalidated, lookup);
  return unvalidated;
}

// TODO add function Predicate<Ingredient> -> Predicate<LootEntry>

function replaceItemInEntry(predicate: Predicate<Ingredient>, to: LootEntry) {
  const replace = (base: LootEntryBase): LootEntry => {
    const entry = extendLootEntry(base);
    const shared: Omit<LootEntryBase, "type"> = {
      functions: entry.functions,
      conditions: entry.conditions,
    };
    switch (entry.type) {
      case "minecraft:alternatives":
        return {
          ...entry,
          children: entry.children.map(replace),
        };

      case "minecraft:item":
        return predicate(new ItemIngredient(entry.name))
          ? { ...shared, ...to }
          : entry;

      case "minecraft:tag":
        return predicate(new ItemTagIngredient(entry.name))
          ? { ...shared, ...to }
          : entry;

      default:
        return entry;
    }
  };

  return replace;
}

export function replaceItemInTable(
  predicate: Predicate<Ingredient>,
  to: LootEntry,
) {
  const replaceEntry = replaceItemInEntry(predicate, to);
  return (table: LootTable): LootTable => {
    return {
      ...table,
      pools: table.pools.map((pool) => ({
        ...pool,
        entries: pool.entries.map(replaceEntry),
      })),
    };
  };
}
