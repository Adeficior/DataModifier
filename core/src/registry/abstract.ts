import type { Id, IdInput, NormalizedId } from "../common/id";

export type Registry<T> = {
  get(id: IdInput): T | undefined;
  forEach(consumer: (value: T, id: Id) => void): void;
  forEachAsync(consumer: (value: T, id: Id) => Promise<void>): Promise<void>;
  keys(): IteratorObject<NormalizedId>;
  has(id: IdInput): boolean;
};
