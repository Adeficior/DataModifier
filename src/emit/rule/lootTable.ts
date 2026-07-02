import type { ContextLike, Logger } from "@adeficior/pack-resolver";
import type { Predicate } from "../../common/filters.js";
import type { Id } from "../../common/id.js";
import {
  ItemIngredient,
  ItemTagIngredient,
  type Ingredient,
} from "../../common/ingredient/index.js";
import type { LootEntryBase, LootTable } from "../../schema/data/loot.js";
import { extendLootEntry } from "../../schema/data/loot.js";
import type { Modifier } from "./index.js";
import Rule from "./index.js";

// TODO add function Predicate<Ingredient> -> Predicate<LootEntry>

function entryMatches(
  logger: Logger,
  test: Predicate<Ingredient>,
  base: LootEntryBase,
): boolean {
  try {
    const entry = extendLootEntry(base);
    switch (entry.type) {
      case "minecraft:alternatives":
        return entry.children.some((it) => entryMatches(logger, test, it));
      case "minecraft:item":
        return test(new ItemIngredient(entry.name), logger);
      case "minecraft:tag":
        return test(new ItemTagIngredient(entry.name), logger);
      default:
        return false;
    }
  } catch {
    logger.warn(`unknown loot entry type:`, base);
    return false;
  }
}

function hasOutput(
  logger: Logger,
  test: Predicate<Ingredient>,
  table: LootTable,
): boolean {
  return table.pools.some((pool) =>
    pool.entries.some((entry) => {
      return entryMatches(logger, test, entry);
    }),
  );
}

export default class LootTableRule extends Rule<LootTable> {
  constructor(
    private readonly context: ContextLike,
    private readonly idTests: Predicate<Id>[],
    private readonly outputTests: Predicate<Ingredient>[],
    modifier: Modifier<LootTable>,
  ) {
    super(modifier);
  }

  matches(id: Id, table: LootTable, logger: Logger): boolean {
    const prefixed = logger;
    return (
      this.idTests.every((test) => test(id, prefixed)) &&
      this.outputTests.every((test) => hasOutput(prefixed, test, table))
    );
  }

  printWarning(logger: Logger) {
    logger.error("Could not find any matching loot table", this.context);
  }
}
