import type { RegistryId } from "@adeficior/data-modifier/generated";
import type { Acceptable, Acceptor } from "@adeficior/pack-resolver";
import * as z from "zod";
import type { LoaderContext } from "../common/context";
import type { IdInput, NormalizedId } from "../common/id";
import { encodeId } from "../common/id";
import { tryCatching, UnknownRegistryEntry } from "../serializer/error";
import { tryParseJson } from "../serializer/textHelper";
import type { RegistryLookup } from "./lookup";
import { RegistryMap } from "./map";

const schema = z.array(z.string());

export class RegistryDumpLoader implements RegistryLookup, Acceptor {
  private readonly registry = new RegistryMap<Set<NormalizedId>, RegistryId>();

  private registryOf(registry: RegistryId) {
    return this.registry.getOrPut(registry, () => new Set<NormalizedId>());
  }

  async accept(
    path: string,
    content: PromiseLike<Acceptable>,
    context: LoaderContext,
  ) {
    const match = /(?<registry>[\w-/]+)\/[\w-]+.json/.exec(path);
    if (!match?.groups) {
      return false;
    }

    const { registry } = match.groups as { registry: string };

    const json = tryParseJson(context.logger, await content);
    if (!json) return false;

    const parsed = tryCatching(context.logger, () => schema.parse(json));
    if (!parsed) return false;

    const set = this.registryOf(registry);
    parsed.map(encodeId).forEach((id) => set.add(id));
  }

  registries() {
    return this.registry.keys();
  }

  keys<T extends RegistryId>(registry: IdInput<T>) {
    return this.registry.get(registry)?.values();
  }

  isKnown(registry: IdInput<RegistryId>) {
    return this.registry.has(registry);
  }

  validateEntry(registry: RegistryId, id: IdInput) {
    const set = this.registry.get(registry);
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
    this.registryOf(key).add(id);
    return id;
  }
}
