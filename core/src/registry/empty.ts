import type { RegistryId } from "@adeficior/data-modifier/generated";
import { encodeId } from "../common/id";
import type { IdInput, NormalizedId } from "../common/id";
import type { RegistryLookup } from "./lookup";

export class EmptyRegistryLookup implements RegistryLookup {
  isKnown(): boolean {
    return false;
  }

  registries(): NormalizedId<RegistryId>[] {
    return [];
  }

  keys() {
    return undefined;
  }

  validate() {
    // Nothing done
  }

  validateEntry() {
    // Nothing done
  }

  addCustom(_key: RegistryId, id: IdInput) {
    return encodeId(id);
  }
}
