import type { Id, IdInput, NormalizedId } from "../common/id";
import { createId, encodeId } from "../common/id";
import type { Registry } from "./abstract";

export class RegistryMap<
  TEntry,
  TId extends string = string,
> implements Registry<TEntry> {
  private readonly _entries = new Map<NormalizedId<TId>, TEntry>();

  set(key: IdInput<TId>, value: TEntry) {
    this._entries.set(encodeId(key), value);
  }

  get(key: IdInput<TId>) {
    return this._entries.get(encodeId(key));
  }

  getOrPut(key: IdInput<TId>, defaultValue: () => TEntry) {
    const existing = this.get(key);
    if (existing) return existing;

    const created = defaultValue();
    this.set(key, created);
    return created;
  }

  forEach(consumer: (value: TEntry, key: Id) => void) {
    this._entries.forEach((value, key) => consumer(value, createId(key)));
  }

  async forEachAsync(
    consumer: (value: TEntry, key: Id) => Promise<void>,
  ): Promise<void> {
    const promises: Promise<void>[] = [];
    this.forEach((...args) => promises.push(consumer(...args)));
    await Promise.all(promises);
  }

  delete(id: IdInput<TId>) {
    this._entries.delete(encodeId(id));
  }

  clear() {
    this._entries.clear();
  }

  keys() {
    return this._entries.keys();
  }

  values() {
    return this._entries.values();
  }

  entries() {
    return this._entries.entries();
  }

  has(key: IdInput<TId>) {
    return this._entries.has(encodeId(key));
  }
}
