import type { RegistryId } from "@adeficior/data-modifier/generated";
import type RegistryLookup from "../loader/registry";
import type { SemVerInput } from "../packFormat";
import type { NormalizedId } from "./id";

export interface Serializable {
  serialize(packFormat: SemVerInput): unknown;
  validate(lookup: RegistryLookup): void;
  idsFor(registry: NormalizedId<RegistryId>): NormalizedId<RegistryId>[];
}
