import type { RegistryId } from "@adeficior/data-modifier/generated";
import type RegistryLookup from ".";
import type { IdInput, NormalizedId } from "../../common/id";
import { encodeId } from "../../common/id";

export default class EmptyRegistryLookup implements RegistryLookup {
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

  addCustom(key: RegistryId, id: IdInput) {
    return encodeId(id);
  }
}
