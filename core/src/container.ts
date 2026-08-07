import { type Services } from "@adeficior/data-modifier-core/generated";

export type Container<TServices extends Record<string, unknown> = Services> = {
  get<TKey extends keyof TServices>(key: TKey): TServices[TKey];
  getOrNull<TKey extends keyof TServices>(key: TKey): TServices[TKey] | null;

  get<T>(key: string): T;
  getOrNull<T>(key: string): T | null;
};
