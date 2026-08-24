import type { Resolver } from "@adeficior/pack-resolver";
import { createResolver } from "@adeficior/pack-resolver";
import type { SemVerInput } from "./common/packFormat";
import type { CoreModuleOptions } from "./module";
import type { ModuleConfig } from "./modules/define";

export type ModuleSetupOptions = {
  packFormat: SemVerInput;
};

export type DataModifierOptions = ModuleSetupOptions & CoreModuleOptions;

export type CodeGenOptions = {
  typesDir?: string;
  registryTypes?: boolean | "dump" | "stubs";
  moduleTypes?: boolean;
};

export type DataModifierConfig = DataModifierOptions & {
  modules?: (string | ModuleConfig)[];
  codegen?: CodeGenOptions;
};

export function defineModifierConfig(
  config: DataModifierConfig,
): DataModifierConfig {
  return config;
}

export async function resolveDumpDir(
  dump: CoreModuleOptions["dump"],
): Promise<Resolver | null> {
  if (!dump) return null;
  if (dump === true) return resolveDumpDir("dump");
  if (typeof dump === "string")
    return createResolver({ from: dump, logger: false });
  return dump;
}
