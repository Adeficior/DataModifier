import type {
  IdInput,
  RegistryLookup,
  TagInput,
} from "@adeficior/data-modifier-core";
import { encodeId, RegistryMap } from "@adeficior/data-modifier-core";
import { fromJson } from "@adeficior/data-modifier-core/serializer";
import type { InferIds, RegistryId } from "@adeficior/data-modifier/generated";
import type { Acceptable, Acceptor } from "@adeficior/pack-resolver";
import { entryId, orderTagEntries, tagFolderOf } from "./helper";
import type {
  TagDefinition,
  TagEntry,
  TagRegistries,
  TagRegistry,
} from "./schema";

class WriteableTagRegistry<T extends RegistryId> implements TagRegistry<T> {
  private readonly entries = new RegistryMap<TagEntry<T>[]>();

  constructor() {}

  private validateId(input: IdInput) {
    const id = encodeId(input);
    if (!id.startsWith("#")) throw new Error("tag id's must start with a '#'");
  }

  load(id: TagInput, definition: TagDefinition) {
    this.validateId(id);

    const existingEntries = this.entries.get(id) ?? [];
    const unique = orderTagEntries([
      ...existingEntries,
      ...(definition.values ?? []),
    ]);
    // TODO support for advanced-tag-loader packs?

    this.entries.set(id, unique as TagEntry<T>[]);
  }

  list() {
    return this.entries.keys();
  }

  get(id: TagInput) {
    this.validateId(id);
    return this.entries.get(id);
  }

  resolve(input: TagInput, level = 0): TagEntry<T>[] {
    const id = encodeId(input);
    if (level >= 100) throw new Error(`Circular TagDefinition: ${id}`);

    const entries = this.get(input) ?? [];

    return entries.flatMap((it) => {
      const entry = entryId(it);
      const required = typeof it === "string" ? true : it.required !== false;

      if (entry.startsWith("#")) {
        if (entry === id)
          throw new Error(`Circular TagDefinition: ${entry} -> ${id}`);
        const step = this.resolve(entry as TagInput);
        if (required) return step;
        return step.map((it) => {
          if (typeof it === "string") return { required: false, id: it };
          return { ...it, required: false };
        });
      }

      return [it];
    });
  }

  contains(id: TagInput, entry: IdInput<InferIds<RegistryId>>): boolean {
    const entryId = encodeId(entry);
    return (
      this.get(id)?.some((it) => {
        const value = encodeId(typeof it === "string" ? it : it.id);
        if (value === entryId) return true;
        if (value.startsWith("#"))
          return this.contains(value as TagInput, entryId);
        return false;
      }) ?? false
    );
  }
}

export class TagsLoader implements TagRegistries, Acceptor {
  private readonly registries = new RegistryMap<
    WriteableTagRegistry<RegistryId>,
    RegistryId
  >();

  constructor(private readonly lookup: RegistryLookup) {}

  registry<T extends RegistryId>(key: IdInput<T>) {
    return this.registries.getOrPut(key, () => new WriteableTagRegistry());
  }

  private registryOf(path: string) {
    for (const key of this.lookup.registries()) {
      const folder = this.lookup.metadata(key)?.tags ?? tagFolderOf(key);
      if (path.startsWith(`${folder}/`)) {
        return { key, folder };
      }
    }

    return null;
  }

  private parsePath(input: string) {
    const match = /data\/(?<namespace>[\w-]+)\/(?<rest>[\w-/]+).json/.exec(
      input,
    );
    if (!match?.groups) return null;

    const { namespace, rest } = match.groups as {
      namespace: string;
      rest: string;
    };

    const registry = this.registryOf(rest);

    if (!registry) return null;

    const path = rest!.substring(registry.folder.length + 1);

    return { namespace, registry, path, isTag: true };
  }

  async accept(path: string, content: PromiseLike<Acceptable>) {
    const info = this.parsePath(path);
    if (!info) return false;

    const parsed: TagDefinition = fromJson(await content);
    const id = encodeId(info) as TagInput;

    this.registry(info.registry.key).load(id, parsed);
  }
}
