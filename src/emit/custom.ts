import { simpleResolver, type BaseContext } from "@adeficior/pack-resolver";
import type { IdInput } from "../common/id.js";
import { createId } from "../common/id.js";
import Registry from "../common/registry.js";
import { toJson } from "../textHelper.js";
import type { ClearableEmitter, PathProvider } from "./index.js";

export default class CustomEmitter<TEntry> implements ClearableEmitter {
  constructor(
    private readonly pathProvider: PathProvider,
    private readonly encoder: (
      value: TEntry,
    ) => string | Promise<string> = toJson,
  ) {}

  private readonly customEntries = new Registry<TEntry>();

  clear() {
    this.customEntries.clear();
  }

  add(id: IdInput, value: TEntry) {
    this.customEntries.set(createId(id), value);
  }

  merge(id: IdInput, entry: TEntry, merger: (a: TEntry, b: TEntry) => TEntry) {
    this.modify(id, (existing) => {
      if (existing) return merger(existing, entry);
      return entry;
    });
  }

  modify(id: IdInput, factory: (existing?: TEntry) => TEntry) {
    const existing = this.customEntries.get(id);
    if (existing) this.add(id, factory(existing));
    else this.add(id, factory());
  }

  resolver(context: BaseContext) {
    return simpleResolver(async (acceptor) => {
      await this.customEntries.forEachAsync(async (entry, id) => {
        const path = this.pathProvider(id);
        await acceptor(path, Promise.resolve(this.encoder(entry)));
      });
    }, context);
  }

  has(id: IdInput) {
    return this.customEntries.has(id);
  }
}
