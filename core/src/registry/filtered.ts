import type { Id, IdInput } from "../common/id";
import { createId } from "../common/id";
import type { Rule } from "../common/rules";
import type { RegistryProvider } from "./abstract";

class FilteredRegistryProvider<T> implements RegistryProvider<T> {
  constructor(
    private readonly inner: RegistryProvider<T>,
    private readonly exclude: Rule<T>,
  ) {}

  forEach(consumer: (value: T, id: Id) => void): void {
    this.inner.forEach((value, id) => {
      if (this.exclude.matches(id, value)) return;
      consumer(value, id);
    });
  }

  async forEachAsync(consumer: (value: T, id: Id) => Promise<void>) {
    await this.inner.forEachAsync(async (value, id) => {
      if (this.exclude.matches(id, value)) return;
      await consumer(value, id);
    });
  }

  get(id: IdInput) {
    const entry = this.inner.get(id);
    if (entry && this.exclude.matches(createId(id), entry)) return undefined;
    return entry;
  }
}

export function filterRegistry<T>(
  registry: RegistryProvider<T>,
  exclude: Rule<T>,
) {
  return new FilteredRegistryProvider(registry, exclude);
}
