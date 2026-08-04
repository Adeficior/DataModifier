import {
  toJson,
  type ClearableEmitter,
  type CommonFilter,
  type LoaderContext,
  type NormalizedId,
  type TagInput,
} from "@adeficior/data-modifier-core";
import type { InferIds, RegistryId } from "@adeficior/data-modifier/generated";
import { simpleResolver } from "@adeficior/pack-resolver";
import { orderTagEntries, tagFolderOf } from "../helper";
import type { TagRegistryHolder } from "../loader";
import { type TagEntry } from "../schema";
import type { TagEmitterOptions } from "./options";
import { ScopedEmitter, type ScopedTagRules } from "./scoped";

export interface TagRules {
  add<T extends RegistryId>(
    registry: T,
    id: TagInput,
    value: TagEntry<InferIds<T>>,
  ): void;

  remove<T extends RegistryId>(
    registry: T,
    id: TagInput,
    test: CommonFilter<NormalizedId<InferIds<T>>>,
  ): void;

  scoped<T extends RegistryId>(key: T, folder?: string): ScopedTagRules<T>;

  empty<T extends RegistryId>(registry: T, id: TagInput): void;

  replace<T extends RegistryId>(
    registry: T,
    id: TagInput,
    values: TagEntry<InferIds<T>>[],
  ): void;

  blocks: ScopedTagRules<"minecraft:block">;
  items: ScopedTagRules<"minecraft:item">;
  fluids: ScopedTagRules<"minecraft:fluid">;
}

export class TagEmitter implements TagRules, ClearableEmitter {
  private readonly emitters = new Map<string, ScopedEmitter<RegistryId>>();

  readonly blocks: ScopedTagRules<"minecraft:block">;
  readonly items: ScopedTagRules<"minecraft:item">;
  readonly fluids: ScopedTagRules<"minecraft:fluid">;

  constructor(
    private readonly registry: TagRegistryHolder,
    private readonly options: TagEmitterOptions,
  ) {
    this.blocks = this.scoped("minecraft:block", "blocks");
    this.items = this.scoped("minecraft:item", "items");
    this.fluids = this.scoped("minecraft:fluid", "fluids");
  }

  clear() {
    this.emitters.forEach((it) => it.clear());
  }

  resolver(context: LoaderContext) {
    return simpleResolver(async (acceptor) => {
      const emitters = Array.from(this.emitters.values());
      await Promise.all(
        emitters.flatMap((scoped) =>
          scoped.getModified(async (id, definition) => {
            const path = `data/${id.namespace}/tags/${scoped.folder}/${id.path}.json`;
            await acceptor(
              path,
              toJson({
                ...definition,
                values: definition.values && orderTagEntries(definition.values),
                remove: definition.remove && orderTagEntries(definition.remove),
              }),
            );
          }),
        ),
      );
    }, context);
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
    test: CommonFilter<NormalizedId<InferIds<T>>>,
  ) {
    this.scoped<T>(registry).remove(id, test);
  }

  replace<T extends RegistryId>(
    registry: T,
    id: TagInput,
    values: TagEntry<InferIds<T>>[],
  ) {
    this.scoped<T>(registry).replace(id, values);
  }

  empty<T extends RegistryId>(registry: T, id: TagInput) {
    this.scoped(registry).empty(id);
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
