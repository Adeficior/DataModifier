import type { InferIds, RegistryId } from "@adeficior/data-modifier/generated";
import type { Id, IdInput, NormalizedId } from "../common/id";

export type RegistryMetadata = Id & {
  tags?: string;
};

export type RegistryLookup = {
  registries(): IteratorObject<NormalizedId<RegistryId>>;

  metadata(registry: IdInput<RegistryId>): RegistryMetadata | undefined;

  keys<T extends RegistryId>(
    registry: IdInput<T>,
  ): IteratorObject<NormalizedId<InferIds<T>>> | undefined;

  isKnown(registry: IdInput<RegistryId>): boolean;

  validateEntry(key: RegistryId, id: IdInput): void;

  addCustom<T extends RegistryId>(key: T, id: IdInput): InferIds<T>;
};
