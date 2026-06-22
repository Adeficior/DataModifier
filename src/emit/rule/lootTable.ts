import type { Logger } from "@adeficior/pack-resolver";
import { exists } from "@adeficior/pack-resolver";
import type { Id } from "../../common/id.js";
import type { IngredientInput, Predicate } from "../../common/ingredient.js";
import type { LootEntryBase, LootTable } from "../../schema/data/loot.js";
import { extendLootEntry } from "../../schema/data/loot.js";
import type { Modifier } from "./index.js";
import Rule from "./index.js";

function entryMatches(
  logger: Logger,
  test: Predicate<IngredientInput>,
  base: LootEntryBase,
): boolean {
  try {
    const entry = extendLootEntry(base);
    switch (entry.type) {
      case "minecraft:alternatives":
        return entry.children.some((it) => entryMatches(logger, test, it));
      case "minecraft:item":
        return test({ item: entry.name }, logger);
      case "minecraft:tag":
        return test({ tag: entry.name }, logger);
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
  test: Predicate<IngredientInput>,
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
    private readonly shape: unknown[],
    private readonly idTests: Predicate<Id>[],
    private readonly outputTests: Predicate<IngredientInput>[],
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
    logger.error(
      "Could not find any loot table matching",
      ...this.shape.filter(exists),
    );
  }
}
