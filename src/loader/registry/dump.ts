import type { RegistryId } from "@adeficior/data-modifier/generated";
import type { Acceptable, Acceptor, Logger } from "@adeficior/pack-resolver";
import zod from "zod";
import type { IdInput, NormalizedId } from "../../common/id.js";
import { encodeId } from "../../common/id.js";
import Registry from "../../common/registry.js";
import { tryCatching, UnknownRegistryEntry } from "../../error.js";
import { tryParseJson } from "../index.js";
import type RegistryLookup from "./index.js";

const schema = zod.array(zod.string());

export default class RegistryDumpLoader implements RegistryLookup, Acceptor {
  private readonly registry = new Registry<Set<NormalizedId>, RegistryId>();

  constructor(private readonly logger: Logger) {}

  private registryOf(registry: RegistryId) {
    return this.registry.getOrPut(registry, () => new Set<NormalizedId>());
  }

  async accept(path: string, content: PromiseLike<Acceptable>) {
    const match = /(?<registry>[\w-/]+)\/[\w-]+.json/.exec(path);
    if (!match?.groups) {
      return false;
    }

    const { registry } = match.groups as { registry: string };

    const grouped = this.logger.group(path);

    const json = tryParseJson(grouped, await content);
    if (!json) return false;

    const parsed = tryCatching(grouped, () => schema.parse(json));
    if (!parsed) return false;

    const set = this.registryOf(registry);
    parsed.map(encodeId).forEach((id) => set.add(id));
  }

  registries(): NormalizedId<RegistryId>[] {
    return this.registry.keys();
  }

  keys<T extends RegistryId>(registry: IdInput<T>) {
    const keys = this.registry.get(registry);
    if (keys === undefined) {
      this.logger.warn(
        `tried to access registry '${encodeId(
          registry,
        )}', which has not been loaded`,
      );
    }
    return keys;
  }

  isKnown(registry: IdInput<RegistryId>) {
    return this.registry.has(registry);
  }

  validateEntry(registry: RegistryId, id: IdInput) {
    const keys = this.keys(registry);
    if (!keys) return;

    const normalizedId = encodeId(id);
    if (keys.has(normalizedId)) return;

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
