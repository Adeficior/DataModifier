import type {
  ClearableEmitter,
  LoaderContext,
  NormalizedId,
  RegistryLookup,
  TagInput,
} from "@adeficior/data-modifier-core";
import { RegistryMap } from "@adeficior/data-modifier-core";
import type { CommonFilter } from "@adeficior/data-modifier-core/serializer";
import { toJson } from "@adeficior/data-modifier-core/serializer";
import type { InferIds, RegistryId } from "@adeficior/data-modifier/generated";
import { simpleResolver } from "@adeficior/pack-resolver";
import { orderTagEntries, tagFolderOf } from "../helper";
import type { IdFilterContext } from "../predicates";
import type { TagEntry, TagRegistries } from "../schema";
import type { TagEmitterOptions } from "./options";
import type { ScopedTagEmitter } from "./scoped";
import { ScopedTagEmitterImpl } from "./scoped";

export type TagEmitter = {
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

  scoped<T extends RegistryId>(key: T, folder?: string): ScopedTagEmitter<T>;

  empty<T extends RegistryId>(registry: T, id: TagInput): void;

  replace<T extends RegistryId>(
    registry: T,
    id: TagInput,
    values: TagEntry<InferIds<T>>[],
  ): void;

  blocks: ScopedTagEmitter<"minecraft:block">;
  items: ScopedTagEmitter<"minecraft:item">;
  fluids: ScopedTagEmitter<"minecraft:fluid">;
};

export class TagEmitterImpl implements TagEmitter, ClearableEmitter {
  private readonly emitters = new RegistryMap<
    ScopedTagEmitterImpl<RegistryId>,
    RegistryId
  >();

  readonly blocks;
  readonly items;
  readonly fluids;

  constructor(
    private readonly registry: TagRegistries,
    private readonly lookup: RegistryLookup,
    private readonly options: TagEmitterOptions = {},
  ) {
    this.blocks = this.scoped("minecraft:block");
    this.items = this.scoped("minecraft:item");
    this.fluids = this.scoped("minecraft:fluid");
  }

  clear() {
    this.emitters.forEach((it) => it.clear());
  }

  resolver(context: LoaderContext) {
    return simpleResolver(async (acceptor) => {
      await this.emitters.forEachAsync(async (scoped, key) => {
        const metadata = this.lookup.metadata(key);
        const folder = metadata?.tags ?? tagFolderOf(key);

        await Promise.all(
          scoped.getModified(async (id, definition) => {
            const path = `data/${id.namespace}/${folder}/${id.path}.json`;
            await acceptor(
              path,
              toJson({
                ...definition,
                values: definition.values && orderTagEntries(definition.values),
                remove: definition.remove && orderTagEntries(definition.remove),
              }),
            );
          }),
        );
      });
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

  scoped<T extends RegistryId>(registry: T): ScopedTagEmitter<T> {
    const existing = this.emitters.get(registry);

    if (existing) return existing as ScopedTagEmitter<T>;
    else {
      const tags = this.registry.registry(registry);

      const context: Required<IdFilterContext<T>> = {
        registry,
        tags,
        lookup: this.lookup,
      };
      const emitter = new ScopedTagEmitterImpl(context, this.options);
      this.emitters.set(registry, emitter);
      return emitter as ScopedTagEmitter<T>;
    }
  }
}
