import { type SemVerInput } from "./common/packFormat";
import type { CoreModuleOptions } from "./module";

export type ModuleSetupOptions = {
  packFormat: SemVerInput;
};

export type DataModifierOptions = ModuleSetupOptions & CoreModuleOptions;
