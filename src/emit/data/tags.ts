import type { InferIds, RegistryId } from "@adeficior/data-modifier/generated";
import type { Acceptor, Logger } from "@adeficior/pack-resolver";
import type { Id, NormalizedId, TagInput } from "../../common/id.js";
import { createId, encodeId } from "../../common/id.js";
import { resolveIDTest, type CommonTest } from "../../common/predicates.js";
import Registry from "../../common/registry.js";
import type TagsLoader from "../../loader/tags.js";
import type { TagRegistry } from "../../loader/tags.js";
import { entryId, orderTagEntries } from "../../loader/tags.js";
import type { TagDefinition, TagEntry } from "../../schema/data/tag.js";
import { tagFolderOf } from "../../schema/data/tag.js";
import { toJson } from "../../textHelper.js";
import type { ClearableEmitter } from "../index.js";

export interface TagRules {
  add<T extends RegistryId>(
    registry: T,
    id: TagInput,
    value: TagEntry<InferIds<T>>,
  ): void;

  remove<T extends RegistryId>(
    registry: T,
    id: TagInput,
    test: CommonTest<NormalizedId<InferIds<T>>>,
  ): void;

  scoped<T extends RegistryId>(key: T, folder?: string): ScopedTagRules<T>;

  blocks: ScopedTagRules<"minecraft:block">;
  items: ScopedTagRules<"minecraft:item">;
  fluids: ScopedTagRules<"minecraft:fluid">;
}

interface ScopedTagRules<T extends RegistryId> {
  add(id: TagInput, value: TagEntry<InferIds<T>>): void;
  remove(id: TagInput, test: CommonTest<NormalizedId<InferIds<T>>>): void;
}

type TagModifier = (previous: TagDefinition) => TagDefinition;

class ScopedEmitter<T extends RegistryId> implements ScopedTagRules<T> {
  constructor(
    private readonly registry: TagRegistry<RegistryId>,
    public readonly folder: string,
    private readonly options: TagEmitterOptions,
  ) {}

  private readonly modifiers = new Registry<TagModifier[]>();

  getModified<R>(consumer: (id: Id, definition: TagDefinition) => R): R[] {
    const results: R[] = [];

    this.modifiers.forEach((modifiers, id) => {
      const modified = modifiers.reduce(
        (previous: TagDefinition, modifier) => modifier(previous),
        {
          values: [],
          replace: false,
        },
      );

      results.push(consumer(createId(id), modified));
    });

    return results;
  }

  private modify(id: TagInput, modifier: TagModifier) {
    this.modifiers.getOrPut(id, () => []).push(modifier);
  }

  add(id: TagInput, value: TagEntry) {
    this.modify(id, (previous) => {
      return {
        ...previous,
        values: [...(previous.values ?? []), value],
      };
    });
  }

  remove(id: TagInput, test: CommonTest<NormalizedId<InferIds<T>>>) {
    if (this.options.advancedTags) {
      if (test instanceof RegExp || typeof test === "function") {
        throw new Error(
          "advanced tag loader only accepts tag entries in removal",
        );
      }

      this.modify(id, (previous) => {
        return {
          ...previous,
          remove: [...(previous.remove ?? []), test],
        };
      });
    } else {
      const predicate = resolveIDTest(test, this.registry);
      this.modify(id, (previous) => {
        const defaultValues =
          (previous.replace ? undefined : this.registry.resolve(id)) ?? [];
        return {
          replace: true,
          values: [...defaultValues, ...(previous.values ?? [])].filter(
            (it) => {
              return !predicate(encodeId(entryId(it)));
            },
          ),
        };
      });
    }
  }

  clear() {
    this.modifiers.clear();
  }
}

export interface TagEmitterOptions {
  advancedTags?: boolean;
}

export default class TagEmitter implements TagRules, ClearableEmitter {
  private readonly emitters = new Map<string, ScopedEmitter<RegistryId>>();

  readonly blocks: ScopedTagRules<"minecraft:block">;
  readonly items: ScopedTagRules<"minecraft:item">;
  readonly fluids: ScopedTagRules<"minecraft:fluid">;

  constructor(
    private readonly logger: Logger,
    private readonly registry: TagsLoader,
    private readonly options: TagEmitterOptions,
  ) {
    this.blocks = this.scoped("minecraft:block", "blocks");
    this.items = this.scoped("minecraft:item", "items");
    this.fluids = this.scoped("minecraft:fluid", "fluids");
  }

  clear() {
    this.emitters.forEach((it) => it.clear());
  }

  async emit(acceptor: Acceptor) {
    const emitters = Array.from(this.emitters.values());
    await Promise.all(
      emitters.flatMap((scoped) =>
        scoped.getModified(async (id, definition) => {
          const path = `data/${id.namespace}/tags/${scoped.folder}/${id.path}.json`;
          acceptor(
            path,
            await toJson({
              ...definition,
              values: definition.values && orderTagEntries(definition.values),
              remove: definition.remove && orderTagEntries(definition.remove),
            }),
          );
        }),
      ),
    );
  }

  add<T extends RegistryId>(
    registry: T,
    id: TagInput,
    value: TagEntry<InferIds<T>>,
  ) {
    this.scoped(registry).add(id, value);
  }

  remove<T extends RegistryId>(
    registry: T,
    id: TagInput,
    test: CommonTest<NormalizedId<InferIds<T>>>,
  ) {
    this.scoped<T>(registry).remove(id, test);
  }

  scoped<T extends RegistryId>(
    registry: T,
    folder: string = tagFolderOf(registry),
  ): ScopedTagRules<T> {
    const existing = this.emitters.get(registry);
    if (existing) return existing as ScopedTagRules<T>;
    else {
      const emitter = new ScopedEmitter(
        this.registry.registry(registry),
        folder,
        this.options,
      );
      this.emitters.set(registry, emitter);
      return emitter as ScopedTagRules<T>;
    }
  }
}
