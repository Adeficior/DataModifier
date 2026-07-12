import type { Id, IdInput, NormalizedId } from "./id.js";
import { createId, encodeId } from "./id.js";

export default class Registry<TEntry, TId extends string = string> {
  private readonly entries = new Map<NormalizedId<TId>, TEntry>();

  set(key: IdInput<TId>, value: TEntry) {
    this.entries.set(encodeId(key), value);
  }

  get(key: IdInput<TId>) {
    return this.entries.get(encodeId(key));
  }

  getOrPut(key: IdInput<TId>, defaultValue: () => TEntry) {
    const existing = this.get(key);
    if (existing) return existing;

    const created = defaultValue();
    this.set(key, created);
    return created;
  }

  forEach(consumer: (value: TEntry, key: Id) => void) {
    this.entries.forEach((value, key) => consumer(value, createId(key)));
  }

  async forEachAsync(
    consumer: (value: TEntry, key: Id) => Promise<void>,
  ): Promise<void> {
    const promises: Promise<void>[] = [];
    this.forEach((...args) => promises.push(consumer(...args)));
    await Promise.all(promises);
  }

  filter(
    predicate: (value: TEntry, key: Id) => boolean,
  ): [NormalizedId<TId>, TEntry][] {
    return [...this.entries.entries()].filter(([id, v]) =>
      predicate(v, createId(id)),
    );
  }

  delete(id: IdInput<TId>) {
    this.entries.delete(encodeId(id));
  }

  clear() {
    this.entries.clear();
  }

  keys() {
    return [...this.entries.keys()];
  }

  values() {
    return [...this.entries.values()];
  }

  has(key: IdInput<TId>) {
    return this.entries.has(encodeId(key));
  }
}
