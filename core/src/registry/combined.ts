import type { Id, IdInput } from "../common/id";
import type { Registry } from "./abstract";

export class CombinedRegistry<T> implements Registry<T> {
  constructor(private readonly registries: Registry<T>[]) {}

  forEach(consumer: (value: T, id: Id) => void): void {
    this.registries.forEach((it) => it.forEach(consumer));
  }

  async forEachAsync(consumer: (value: T, id: Id) => Promise<void>) {
    await Promise.all(this.registries.map((it) => it.forEachAsync(consumer)));
  }

  get(id: IdInput) {
    for (const registry of this.registries) {
      const match = registry.get(id);
      if (match) return match;
    }
  }

  has(id: IdInput) {
    return this.registries.some((it) => it.has(id));
  }

  keys() {
    return concat(this.registries.map((it) => it.keys()));
  }
}

function* concat<T>(iterables: Iterable<T>[]) {
  for (const iterable of iterables) {
    yield* iterable;
  }
}
