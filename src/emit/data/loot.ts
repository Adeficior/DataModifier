import { combineResolvers, type BaseContext } from "@adeficior/pack-resolver";
import {
  resolveIDTest,
  type CommonFilter,
  type Predicate,
} from "../../common/filters.js";
import type { Id, IdInput, NormalizedId } from "../../common/id.js";
import { encodeId, prefix } from "../../common/id.js";
import type { IngredientFilter } from "../../common/ingredient/filter.js";
import createIngredientPredicate from "../../common/ingredient/filter.js";
import type { Ingredient } from "../../common/ingredient/index.js";
import type { PackContext } from "../../loader/context.js";
import { lootTableFolder } from "../../packFormat.js";
import type { LootItemInput } from "../../parser/lootTable.js";
import { createLootEntry, replaceItemInTable } from "../../parser/lootTable.js";
import type { LootModifier, LootTable } from "../../schema/data/loot.js";
import { EmptyLootEntry, LootTableSchema } from "../../schema/data/loot.js";
import CustomEmitter from "../custom.js";
import type { ClearableEmitter, RegistryProvider } from "../index.js";
import LootTableRule from "../rule/lootTable.js";
import RuledEmitter from "../ruled.js";

export const EMPTY_LOOT_TABLE: LootTable = {
  type: "minecraft:empty",
  pools: [],
};

export const EMPTY_LOOT_MODIFIER: LootModifier = {
  type: "noop",
};

type LootTableTest = Readonly<{
  id?: CommonFilter<NormalizedId>;
  output?: IngredientFilter;
}>;

export interface LootRules {
  replaceOutput(
    from: IngredientFilter,
    to: LootItemInput,
    additionalTests?: LootTableTest,
  ): void;

  removeOutput(from: IngredientFilter, additionalTests?: LootTableTest): void;

  add(id: IdInput, value: LootTable): void;

  disable(test: LootTableTest): void;

  block(id: IdInput): void;

  addModifier<T extends LootModifier>(id: IdInput, value: T): void;

  disabledModifier(id: IdInput): void;
}

export default class LootTableEmitter implements LootRules, ClearableEmitter {
  private readonly customTables = new CustomEmitter<LootTable>((it) =>
    this.tablePath(it),
  );
  private readonly customModifiers = new CustomEmitter<LootModifier>((it) =>
    this.modifierPath(it),
  );

  private readonly ruled: RuledEmitter<LootTable, LootTableRule>;

  constructor(
    private readonly lootTables: RegistryProvider<LootTable>,
    private readonly context: PackContext,
  ) {
    this.ruled = new RuledEmitter<LootTable, LootTableRule>(
      this.lootTables,
      (id) => this.tablePath(id),
      EMPTY_LOOT_TABLE,
      // TODO also add value object here?
      (it) => it,
      (id) => this.customTables.has(id),
    );
  }

  resolver(context: BaseContext) {
    return combineResolvers(
      [
        this.ruled.resolver(context),
        this.customTables.resolver(context),
        this.customModifiers.resolver(context),
      ],
      { async: true },
    );
  }

  private tablePath(id: Id) {
    const folder = lootTableFolder(this.context.packFormat);
    return `data/${id.namespace}/${folder}/${id.path}.json`;
  }

  private modifierPath(id: Id) {
    return `data/${id.namespace}/loot_modifiers/${id.path}.json`;
  }

  clear() {
    this.customTables.clear();
    this.customModifiers.clear();
    this.ruled.clear();
  }

  resolveIngredientTest(test: IngredientFilter) {
    return createIngredientPredicate(test, this.context);
  }

  private resolveLootTableTest(test: LootTableTest) {
    const id: Predicate<Id>[] = [];
    const output: Predicate<Ingredient>[] = [];

    if (test.id) id.push(resolveIDTest(test.id));
    if (test.output) output.push(this.resolveIngredientTest(test.output));

    return { id, output };
  }

  add(id: IdInput, value: LootTable): void {
    this.customTables.add(id, LootTableSchema.parse(value));
  }

  disable(test: LootTableTest): void {
    const predicates = this.resolveLootTableTest(test);
    this.ruled.addRule(
      new LootTableRule(
        { operation: "remove", test },
        predicates.id,
        predicates.output,
        () => null,
      ),
    );
  }

  replaceOutput(
    from: IngredientFilter,
    to: LootItemInput,
    additionalTests: LootTableTest = {},
  ): void {
    const predicates = this.resolveLootTableTest(additionalTests);
    const outputPredicate = this.resolveIngredientTest(from);
    const replacer = replaceItemInTable(
      outputPredicate,
      createLootEntry(to, this.context.lookup),
    );
    this.ruled.addRule(
      new LootTableRule(
        { operation: "replace output", from, to, test: additionalTests },
        predicates.id,
        [outputPredicate, ...predicates.output],
        replacer,
      ),
    );
  }

  removeOutput(from: IngredientFilter, additionalTests?: LootTableTest) {
    this.replaceOutput(from, EmptyLootEntry, additionalTests);
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
