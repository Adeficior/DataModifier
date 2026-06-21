import type { Acceptor } from "@adeficior/pack-resolver";
import type { Id } from "../common/id.js";

export interface RegistryProvider<T> {
  forEach(consumer: (recipe: T, id: Id) => void): void;
  forEachAsync(consumer: (recipe: T, id: Id) => Promise<void>): Promise<void>;
}

export type PathProvider = (id: Id) => string;

export interface ClearableEmitter {
  clear(): void;

  emit(acceptor: Acceptor): Promise<void>;
}
