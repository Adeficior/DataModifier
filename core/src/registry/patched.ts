import type { IdInput } from "../common/id";
import type { Registry } from "./abstract";
import { CombinedRegistry } from "./combined";
import { filterRegistry } from "./filtered";
import { RegistryMap } from "./map";

export class PatchedRegistry<
  TEntry,
  TId extends string = string,
> extends CombinedRegistry<TEntry> {
  private readonly patched;

  constructor(loaded: Registry<TEntry>) {
    const patched = new RegistryMap<TEntry, TId>();
    const filtered = filterRegistry(loaded, (id) => !patched.has(id));
    super([patched, filtered]);
    this.patched = patched;
  }

  set(key: IdInput<TId>, value: TEntry) {
    this.patched.set(key, value);
  }
}
