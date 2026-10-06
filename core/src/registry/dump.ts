import type { RegistryId } from "@adeficior/data-modifier/generated";
import type { Acceptable, Acceptor, Resolver } from "@adeficior/pack-resolver";
import * as z from "zod";
import type { LoaderContext } from "../common/context";
import type { Id, IdInput, NormalizedId } from "../common/id";
import { createId, encodeId } from "../common/id";
import { tryCatching, UnknownRegistryEntry } from "../serializer/error";
import { fromJson, tryParseJson } from "../serializer/textHelper";
import type { RegistryLookup, RegistryMetadata } from "./lookup";
import { RegistryMap } from "./map";

const metadataSchema = z.object({
  version: z.number().positive(),
});
const registrySchema = z.object({
  namespace: z.string().nonempty(),
  path: z.string().nonempty(),
  tags: z.string().nonempty().optional(),
});
const entriesSchema = z.array(z.string());

export async function createDumpLookup(resolver: Resolver) {
  const loader = new RegistryDumpLoader();
  await resolver.extract(loader);
  return loader.buildLookup();
}

class RegistryDumpLoader implements Acceptor {
  private readonly entries = new RegistryMap<Set<NormalizedId>, string>();
  private readonly metadata = new RegistryMap<RegistryMetadata, string>();
  private version = 1;

  async accept(
    path: string,
    content: PromiseLike<Acceptable>,
    context: LoaderContext,
  ) {
    if (path === ".metadata.json") {
      const json = fromJson(await content);
      const metadata = metadataSchema.parse(json);
      this.version = metadata.version;
      return;
    }

    const match = /(?<registry>[\w-/]+)\/(?<name>[.\w-]+).json/.exec(path);
    if (!match?.groups) {
      return false;
    }

    const { registry, name } = match.groups as {
      registry: string;
      name: string;
    };

    if (name === ".registry") {
      const json = fromJson(await content);
      const metadata = registrySchema.parse(json);
      this.metadata.set(registry, metadata);
      return;
    }

    const json = tryParseJson(context.logger, await content);
    if (!json) return false;

    const parsed = tryCatching(context.logger, () => entriesSchema.parse(json));
    if (!parsed) return false;

    const set = this.entries.getOrPut(registry, () => new Set());
    parsed.map(encodeId).forEach((id) => set.add(id));
  }

  private buildRegistryId(from: string): Id {
    if (this.version > 1) {
      const [namespace, ...path] = from.split("/");
      if (!namespace || path.length === 0)
        throw new Error("invalid registry dump");
      return { namespace, path: path.join("/") };
    }

    return createId(from);
  }

  buildLookup(): RegistryLookup {
    const buildEntries = new RegistryMap<Set<NormalizedId>, RegistryId>();
    const buildMetadata = new RegistryMap<RegistryMetadata, RegistryId>();

    this.entries.forEach((entries, key) => {
      const id = this.buildRegistryId(key.path);
      buildEntries.set(id, entries);
      if (this.version > 1) {
        const metadata = this.metadata.get(key);
        if (metadata) buildMetadata.set(id, metadata);
      } else {
        buildMetadata.set(id, id);
      }
    });

    buildMetadata.forEach((_, key) => {
      buildEntries.getOrPut(key, () => new Set());
    });

    return new RegistryDumpLookup(buildEntries, buildMetadata);
  }
}

class RegistryDumpLookup implements RegistryLookup {
  constructor(
    private readonly _entries: RegistryMap<Set<NormalizedId>, RegistryId>,
    private readonly _metadata: RegistryMap<RegistryMetadata, RegistryId>,
  ) {}

  registries() {
    return this._entries.keys();
  }

  keys<T extends RegistryId>(registry: IdInput<T>) {
    return this._entries.get(registry)?.values();
  }

  isKnown(registry: IdInput<RegistryId>) {
    return this._entries.has(registry);
  }

  validateEntry(registry: RegistryId, id: IdInput) {
    const set = this._entries.get(registry);
    if (!set) return;

    const normalizedId = encodeId(id);
    if (set.has(normalizedId)) return;

    throw new UnknownRegistryEntry(
      `unknown ${registry} '${normalizedId}'`,
      registry,
      normalizedId,
    );
  }

  addCustom(key: RegistryId, input: IdInput) {
    const id = encodeId(input);
    const set = this._entries.getOrPut(key, () => new Set());
    set.add(id);
    return id;
  }

  metadata(registry: IdInput<RegistryId>) {
    return this._metadata.get(registry);
  }
}
