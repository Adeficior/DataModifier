import type { RegistryId } from "@adeficior/data-modifier/generated";
import type RegistryLookup from "../loader/registry";
import type { NormalizedId } from "./id";

export interface InputOutput {
  validate(lookup: RegistryLookup): void;
  idsFor(registry: NormalizedId<RegistryId>): NormalizedId<RegistryId>[];
}
