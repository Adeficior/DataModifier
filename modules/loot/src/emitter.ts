import type {
  ClearableEmitter,
  Id,
  IdInput,
  Ingredient,
  IngredientFilter,
  LoaderContext,
  NormalizedId,
  RegistryLookup,
  RegistryProvider,
  SemVerInput,
} from "@adeficior/data-modifier-core";
import {
  CustomEmitter,
  encodeId,
  prefix,
  resolveIdTest,
  RuledEmitter,
  type CommonFilter,
  type Predicate,
  type Predicates,
} from "@adeficior/data-modifier-core";
import { combineResolvers } from "@adeficior/pack-resolver";
import { lootTableFolder } from "./helper";
import { LootTableRule } from "./rule";
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

export class LootTableEmitter implements LootRules, ClearableEmitter {
  private readonly customTables = new CustomEmitter<LootTable>((it) =>
    this.tablePath(it),
  );
  private readonly customModifiers = new CustomEmitter<LootModifier>((it) =>
    this.modifierPath(it),
  );

  private readonly ruled: RuledEmitter<LootTable, LootTableRule>;

  constructor(
    // TODO inject
    private readonly packFormat: SemVerInput,
    private readonly lootTables: RegistryProvider<LootTable>,
    private readonly lookup: RegistryLookup,
    private readonly predicates: Predicates,
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

  private tablePath(id: Id) {
    const folder = lootTableFolder(this.packFormat);
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

  private resolveLootTableTest(test: LootTableTest) {
    const id: Predicate<Id>[] = [];
    const output: Predicate<Ingredient>[] = [];

    if (test.id) id.push(resolveIdTest(test.id));
    if (test.output) output.push(this.predicates.ingredient(test.output));

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
    const outputPredicate = this.predicates.ingredient(from);
    const replacer = replaceItemInTable(
      outputPredicate,
      createLootEntry(to, this.lookup),
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
