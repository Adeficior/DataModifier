import { type Services } from "@adeficior/data-modifier-core/generated";
import { type ModuleConfig } from "./modules/define";

export type Container<TModule extends ModuleConfig = ModuleConfig> = {
  get<TKey extends keyof Services<TModule>>(key: TKey): Services<TModule>[TKey];
  getOrNull<TKey extends keyof Services<TModule>>(
    key: TKey,
  ): Services<TModule>[TKey] | null;

  get<T>(key: string): T;
  getOrNull<T>(key: string): T | null;
};
