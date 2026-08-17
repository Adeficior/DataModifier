import type { RegistryId } from "@adeficior/data-modifier/generated";
import type { NormalizedId } from "../common/id";
import type { RegistryLookup } from "./lookup";

export type RegistryIds = Record<NormalizedId<RegistryId>, NormalizedId[]>;

export interface Registered {
  validate(lookup: RegistryLookup): void;
  ids(): RegistryIds;
  hashCode(): string;
}
