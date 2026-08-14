import { type Id, type Modifier, Rule } from "@adeficior/data-modifier-core";
import {
  IllegalShapeError,
  type Predicate,
  tryCatching,
} from "@adeficior/data-modifier-core/serializer";
import {
  type Ingredient,
  ItemIngredient,
  ItemTagIngredient,
} from "@adeficior/data-modifier-ingredients";
import { type ContextLike, type Logger } from "@adeficior/pack-resolver";
import { type LootEntryBase, type LootTable, extendLootEntry } from "./schema";

// TODO add function Predicate<Ingredient> -> Predicate<LootEntry>

function entryMatches(
  test: Predicate<Ingredient>,
  base: LootEntryBase,
): boolean {
  try {
    const entry = extendLootEntry(base);
    switch (entry.type) {
      case "minecraft:alternatives":
        return entry.children.some((it) => entryMatches(test, it));
      case "minecraft:item":
        return test(new ItemIngredient(entry.name));
      case "minecraft:tag":
        return test(new ItemTagIngredient(entry.name));
      default:
        return false;
    }
  } catch {
    throw new IllegalShapeError(`unknown loot entry type:`, base);
  }
}

function hasOutput(
  logger: Logger,
  test: Predicate<Ingredient>,
  table: LootTable,
): boolean {
  return table.pools.some((pool) =>
    pool.entries.some((entry) => {
      return tryCatching(logger, () => entryMatches(test, entry)) ?? false;
    }),
  );
}

export class LootTableRule extends Rule<LootTable> {
  constructor(
    private readonly context: ContextLike,
    private readonly idTests: Predicate<Id>[],
    private readonly outputTests: Predicate<Ingredient>[],
    modifier: Modifier<LootTable>,
  ) {
    super(modifier);
  }

  matches(id: Id, table: LootTable, logger: Logger): boolean {
    return (
      this.idTests.every((test) => test(id)) &&
      this.outputTests.every((test) => hasOutput(logger, test, table))
    );
  }

  printWarning(logger: Logger) {
    logger.trace("could not find any matching loot table", this.context);
  }
}
