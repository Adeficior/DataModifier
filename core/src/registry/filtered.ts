import type { Id, IdInput, NormalizedId } from "../common/id";
import { createId } from "../common/id";
import type { Predicate } from "../serializer";
import type { Registry } from "./abstract";

class FilteredRegistryProvider<T> implements Registry<T> {
  private readonly exclude: Predicate<IdInput>;

  constructor(
    private readonly inner: Registry<T>,
    exclude: Predicate<Id>,
  ) {
    this.exclude = (it) => exclude(createId(it));
  }

  forEach(consumer: (value: T, id: Id) => void): void {
    this.inner.forEach((value, id) => {
      if (this.exclude(id)) return;
      consumer(value, id);
    });
  }

  async forEachAsync(consumer: (value: T, id: Id) => Promise<void>) {
    await this.inner.forEachAsync(async (value, id) => {
      if (this.exclude(id)) return;
      await consumer(value, id);
    });
  }

  get(id: IdInput) {
    if (this.exclude(id)) return undefined;
    return this.inner.get(id);
  }

  has(id: IdInput) {
    return !this.exclude(id) && this.inner.has(id);
  }

  keys(): IteratorObject<NormalizedId> {
    return this.inner.keys().filter((id) => !this.exclude(id));
  }

  entries() {
    return this.inner.entries().filter(([id]) => !this.exclude(id));
  }

  values() {
    return this.entries().map(([, value]) => value);
  }
}

export function filterRegistry<T>(
  registry: Registry<T>,
  exclude: Predicate<Id>,
) {
  return new FilteredRegistryProvider(registry, exclude);
}
