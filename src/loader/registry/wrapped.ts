import type { InferIds, RegistryId } from "@adeficior/data-modifier/generated";
import type RegistryLookup from ".";
import type { IdInput } from "../../common/id";
import EmptyRegistryLookup from "./empty";

export default class WrappedRegistryLookup implements RegistryLookup {
  private inner: RegistryLookup = new EmptyRegistryLookup();

  set(value: RegistryLookup) {
    this.inner = value;
  }

  reset() {
    this.set(new EmptyRegistryLookup());
  }

  registries() {
    return this.inner.registries();
  }

  keys<T extends RegistryId>(registry: IdInput<T>) {
    return this.inner.keys(registry);
  }

  isKnown(registry: IdInput<RegistryId>) {
    return this.inner.isKnown(registry);
  }

  validateEntry(key: RegistryId, id: IdInput): void {
    return this.inner.validateEntry(key, id);
  }

  addCustom<T extends RegistryId>(key: T, id: IdInput): InferIds<T> {
    return this.inner.addCustom(key, id);
  }
}
