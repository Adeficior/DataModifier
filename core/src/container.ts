import type { Services } from "@adeficior/data-modifier-core/generated";
import type { ModuleTypes } from "./modules/define";

export type ModulesContainer<T extends ModuleTypes = ModuleTypes> = Container<
  Services<T>
>;

export type Container<TServices extends Record<string, unknown>> = {
  get<TKey extends keyof TServices>(key: TKey): TServices[TKey];
  getOrNull<TKey extends keyof TServices>(key: TKey): TServices[TKey] | null;

  get<T>(key: string): T;
  getOrNull<T>(key: string): T | null;
};
