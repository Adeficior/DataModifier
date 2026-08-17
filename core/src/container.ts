import type { Services } from "@adeficior/data-modifier-core/generated";
import type { ModuleConfig } from "./modules/define";

export type ModulesContainer<TModule extends ModuleConfig = ModuleConfig> =
  Container<Services<TModule>>;

export type Container<TServices extends Record<string, unknown>> = {
  get<TKey extends keyof TServices>(key: TKey): TServices[TKey];
  getOrNull<TKey extends keyof TServices>(key: TKey): TServices[TKey] | null;

  get<T>(key: string): T;
  getOrNull<T>(key: string): T | null;
};
