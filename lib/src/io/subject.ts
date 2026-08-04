import type { RegistryId } from "@adeficior/data-modifier/generated";
import type { NormalizedId } from "../common/id";
import type { RegistryLookup } from "../loader/registry";

export type RegistryIds = Record<NormalizedId<RegistryId>, NormalizedId[]>;

export interface InputOutput {
  validate(lookup: RegistryLookup): void;
  ids(): RegistryIds;
}
