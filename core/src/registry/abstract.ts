import type { Id } from "../common/id";

export interface RegistryProvider<T> {
  forEach(consumer: (recipe: T, id: Id) => void): void;
  forEachAsync(consumer: (recipe: T, id: Id) => Promise<void>): Promise<void>;
}
