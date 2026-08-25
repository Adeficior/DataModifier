import type { InferIds, RegistryId } from "@adeficior/data-modifier/generated";
import type { IdInput, NormalizedId } from "../common/id";

export type RegistryLookup = {
  registries(): IteratorObject<NormalizedId<RegistryId>>;

  keys<T extends RegistryId>(
    registry: IdInput<T>,
  ): IteratorObject<NormalizedId<InferIds<T>>> | undefined;

  isKnown(registry: IdInput<RegistryId>): boolean;

  validateEntry(key: RegistryId, id: IdInput): void;

  addCustom<T extends RegistryId>(key: T, id: IdInput): InferIds<T>;
};
