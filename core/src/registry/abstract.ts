import type { Id, IdInput } from "../common/id";

export type RegistryProvider<T> = {
  get(id: IdInput): T | undefined;
  forEach(consumer: (value: T, id: Id) => void): void;
  forEachAsync(consumer: (value: T, id: Id) => Promise<void>): Promise<void>;
};
