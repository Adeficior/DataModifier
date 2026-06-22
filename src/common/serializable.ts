import type RegistryLookup from "../loader/registry";
import type { SemVerInput } from "../packFormat";

export interface Serializable {
  toJSON(packFormat: SemVerInput): unknown;
  validate(lookup?: RegistryLookup): void;
}
