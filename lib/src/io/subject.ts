import type { RegistryId } from "@adeficior/data-modifier/generated";
import type RegistryLookup from "../loader/registry";
import type { NormalizedId } from "./id";

export type RegistryIds = Record<NormalizedId<RegistryId>, NormalizedId[]>;

export interface InputOutput {
  validate(lookup: RegistryLookup): void;
  ids(): RegistryIds;
}
