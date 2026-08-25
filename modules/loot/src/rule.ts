import type { Id, NormalizedId, Rule } from "@adeficior/data-modifier-core";
import { always, every, some } from "@adeficior/data-modifier-core/serializer";
import type {
  CommonFilter,
  Predicate,
} from "@adeficior/data-modifier-core/serializer";
import type {
  Ingredient,
  IngredientFilter,
  Predicates,
} from "@adeficior/data-modifier-ingredients";
import {
  ItemIngredient,
  ItemTagIngredient,
} from "@adeficior/data-modifier-ingredients";
import { notNull } from "@adeficior/pack-resolver";
import type { LootEntryBase, LootTable } from "./schema";
import { extendLootEntry } from "./schema";

function entryMatches(
  predicate: Predicate<Ingredient>,
  base: LootEntryBase,
): boolean {
  try {
    const entry = extendLootEntry(base);
    switch (entry.type) {
      case "minecraft:alternatives":
        return entry.children.some((it) => entryMatches(predicate, it));
      case "minecraft:item":
        return predicate(new ItemIngredient(entry.name));
      case "minecraft:tag":
        return predicate(new ItemTagIngredient(entry.name));
      default:
        return false;
    }
  } catch {
    return false;
  }
}

export type LootTableFilter = Readonly<{
  id?: CommonFilter<NormalizedId>;
  output?: IngredientFilter;
}>;

type SubjectFilters = Readonly<{
  output?: IngredientFilter;
}>;

class LootTableRule implements Rule<LootTable> {
  constructor(
    private readonly idFilter: Predicate<Id>,
    private readonly outputsFilter: Predicate<LootEntryBase[]>,
  ) {}

  matches(id: Id, value: LootTable): boolean {
    const outputs = value.pools.flatMap((it) => it.entries);
    return this.idFilter(id) && this.outputsFilter(outputs);
  }
}

export type LootTableRules = {
  resolve(
    filter?: LootTableFilter,
    subjectFilters?: SubjectFilters,
  ): Rule<LootTable>;
};

export class LootTableRulesImpl implements LootTableRules {
  constructor(private readonly predicates: Predicates) {}

  private resolveLootTableFilter(test: LootTableFilter) {
    const id: Predicate<Id>[] = [];
    const output: Predicate<Ingredient>[] = [];

    if (test.id) id.push(this.predicates.id(test.id, "minecraft:item"));
    if (test.output) output.push(this.predicates.ingredient(test.output));

    return { id, output };
  }

  private resolveSubjectFilters({ output }: SubjectFilters) {
    return {
      output: notNull(output) ? this.predicates.ingredient(output) : always(),
    };
  }

  private toLootEntryPredicate(
    predicate: Predicate<Ingredient>,
  ): Predicate<LootEntryBase> {
    return (base) => entryMatches(predicate, base);
  }

  resolve(filter: LootTableFilter = {}, subjectFilters: SubjectFilters = {}) {
    const predicates = this.resolveLootTableFilter(filter);
    const subjectPredicates = this.resolveSubjectFilters(subjectFilters);

    return new LootTableRule(
      every(predicates.id),
      every(
        [...predicates.output, subjectPredicates.output]
          .map((it) => this.toLootEntryPredicate(it))
          .map(some),
      ),
    );
  }
}
