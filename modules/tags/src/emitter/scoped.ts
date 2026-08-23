import type { Id, NormalizedId, TagInput } from "@adeficior/data-modifier-core";
import { createId, Registry } from "@adeficior/data-modifier-core";
import type {
  CommonFilter,
  Replacer,
} from "@adeficior/data-modifier-core/serializer";
import { resolveIdTest } from "@adeficior/data-modifier-core/serializer";
import type { InferIds, RegistryId } from "@adeficior/data-modifier/generated";
import { entryId } from "../helper";
import type { TagDefinition, TagEntry, TagRegistry } from "../schema";
import type { TagEmitterOptions } from "./options";

type TagModifier = Replacer<TagDefinition>;

export type ScopedTagEmitter<T extends RegistryId> = {
  add(id: TagInput, value: TagEntry<InferIds<T>>): void;

  remove(id: TagInput, test: CommonFilter<NormalizedId<InferIds<T>>>): void;

  empty(id: TagInput): void;

  replace(id: TagInput, values: TagEntry<InferIds<T>>[]): void;
};

export class ScopedTagEmitterImpl<
  T extends RegistryId,
> implements ScopedTagEmitter<T> {
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

  remove(id: TagInput, test: CommonFilter<NormalizedId<InferIds<T>>>) {
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
      const predicate = resolveIdTest(test, this.registry);
      this.modify(id, (previous) => {
        const defaultValues =
          (previous.replace ? undefined : this.registry.resolve(id)) ?? [];
        return {
          replace: true,
          values: [...defaultValues, ...(previous.values ?? [])].filter(
            (it) => {
              return !predicate(entryId(it));
            },
          ),
        };
      });
    }
  }

  empty(id: TagInput) {
    this.replace(id, []);
  }

  replace(id: TagInput, values: TagEntry<InferIds<T>>[]): void {
    this.modify(id, () => ({ replace: true, values }));
  }

  clear() {
    this.modifiers.clear();
  }
}
