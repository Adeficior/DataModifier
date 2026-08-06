import type { Id, IdInput } from "../common/id";

export interface RegistryProvider<T> {
  get(id: IdInput): T | undefined;
  forEach(consumer: (recipe: T, id: Id) => void): void;
  forEachAsync(consumer: (recipe: T, id: Id) => Promise<void>): Promise<void>;
}
