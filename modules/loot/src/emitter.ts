import type {
  IdInput,
  LoaderContext,
  RegistryLookup,
  SemVerInput,
} from "@adeficior/data-modifier-core";
import {
  CustomEmitter,
  encodeId,
  prefix,
  SimpleEmitter,
} from "@adeficior/data-modifier-core";
import type {
  IngredientFilter,
  Predicates,
} from "@adeficior/data-modifier-ingredients";
import { combineResolvers } from "@adeficior/pack-resolver";
import type { Logger } from "@adeficior/pack-resolver";
import { lootTablePath } from "./helper";
import type { LootTableRegistry } from "./registry";
import type { LootTableFilter, LootTableRules } from "./rule";
import type { LootItemInput, LootModifier, LootTable } from "./schema";
import { EmptyLootEntry, LootTableSchema } from "./schema";
import { createLootEntry, replaceItemInTable } from "./serializer";

export const EMPTY_LOOT_TABLE: LootTable = {
  type: "minecraft:empty",
  pools: [],
};

export const EMPTY_LOOT_MODIFIER: LootModifier = {
  type: "noop",
};

export type LootEmitter = {
  replaceOutput(
    from: IngredientFilter,
    to: LootItemInput,
    additionalFilters?: LootTableFilter,
  ): void;

  removeOutput(
    from: IngredientFilter,
    additionalFilters?: LootTableFilter,
  ): void;

  add(id: IdInput, value: LootTable): void;

  disable(filter: LootTableFilter): void;

  block(id: IdInput): void;

  addModifier<T extends LootModifier>(id: IdInput, value: T): void;

  disabledModifier(id: IdInput): void;
};

export class LootEmitterImpl
  extends SimpleEmitter<LootTable, LootTable>
  implements LootEmitter
{
  private readonly customModifiers = new CustomEmitter<LootModifier>(
    (id) => `data/${id.namespace}/loot_modifiers/${id.path}.json`,
  );

  constructor(
    packFormat: SemVerInput,
    registry: LootTableRegistry,
    logger: Logger,
    private readonly lookup: RegistryLookup,
    private readonly predicates: Predicates,
    private readonly rules: LootTableRules,
  ) {
    super(
      "loot tables",
      registry,
      logger,
      (it) => lootTablePath(packFormat, it),
      EMPTY_LOOT_TABLE,
    );
  }

  override resolver(context: LoaderContext) {
    return combineResolvers(
      [super.resolver(context), this.customModifiers.resolver(context)],
      { async: true },
    );
  }

  override clear() {
    super.clear();
    this.customModifiers.clear();
  }

  add(id: IdInput, value: LootTable): void {
    this.addCustom(id, LootTableSchema.parse(value));
  }

  disable(filter: LootTableFilter): void {
    this.ruled.addRemoval(this.rules.resolve(filter), { filter });
  }

  replaceOutput(
    from: IngredientFilter,
    to: LootItemInput,
    additionalFilters: LootTableFilter = {},
  ): void {
    const modifier = replaceItemInTable(
      this.predicates.ingredient(from),
      createLootEntry(to, this.lookup),
    );

    this.ruled.addRule(
      this.rules.resolve(additionalFilters, { output: from }),
      modifier,
      { operation: "replace output", from, to, filter: additionalFilters },
    );
  }

  removeOutput(from: IngredientFilter, additionalFilters?: LootTableFilter) {
    this.replaceOutput(from, EmptyLootEntry, additionalFilters);
  }

  block(id: IdInput) {
    this.add(prefix(id, "blocks/"), {
      type: "minecraft:block",
      pools: [
        {
          rolls: 1,
          entries: [
            {
              type: "minecraft:item",
              name: encodeId(id),
            },
          ],
          conditions: [
            {
              condition: "minecraft:survives_explosion",
            },
          ],
        },
      ],
    });
  }

  disabledModifier(id: IdInput) {
    this.addModifier(id, EMPTY_LOOT_MODIFIER);
  }

  addModifier<T extends LootModifier>(id: IdInput, value: T) {
    this.customModifiers.add(id, value);
  }
}
