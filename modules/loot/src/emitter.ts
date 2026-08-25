import type {
  ClearableEmitter,
  Id,
  IdInput,
  LoaderContext,
  RegistryLookup,
  RegistryProvider,
  SemVerInput,
} from "@adeficior/data-modifier-core";
import {
  CustomEmitter,
  encodeId,
  prefix,
  RuledEmitter,
} from "@adeficior/data-modifier-core";
import type {
  IngredientFilter,
  Predicates,
} from "@adeficior/data-modifier-ingredients";
import { combineResolvers } from "@adeficior/pack-resolver";
import { lootTablePath } from "./helper";
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

export class LootEmitterImpl implements LootEmitter, ClearableEmitter {
  private readonly customTables = new CustomEmitter<LootTable>((it) =>
    lootTablePath(this.packFormat, it),
  );
  private readonly customModifiers = new CustomEmitter<LootModifier>((it) =>
    this.modifierPath(it),
  );

  private readonly ruled;

  constructor(
    private readonly packFormat: SemVerInput,
    private readonly lootTables: RegistryProvider<LootTable>,
    private readonly lookup: RegistryLookup,
    private readonly predicates: Predicates,
    private readonly rules: LootTableRules,
  ) {
    this.ruled = new RuledEmitter<LootTable>(
      "loot tables",
      this.lootTables,
      (id) => lootTablePath(packFormat, id),
      EMPTY_LOOT_TABLE,
      // TODO also add value object here?
      (it) => it,
      (id) => this.customTables.has(id),
    );
  }

  resolver(context: LoaderContext) {
    return combineResolvers(
      [
        this.ruled.resolver(context),
        this.customTables.resolver(context),
        this.customModifiers.resolver(context),
      ],
      { async: true },
    );
  }

  private modifierPath(id: Id) {
    return `data/${id.namespace}/loot_modifiers/${id.path}.json`;
  }

  clear() {
    this.customTables.clear();
    this.customModifiers.clear();
    this.ruled.clear();
  }

  add(id: IdInput, value: LootTable): void {
    this.customTables.add(id, LootTableSchema.parse(value));
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
