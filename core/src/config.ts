import type { SemVerInput } from "./common/packFormat";

export interface PackLoaderOptions /* extends TagEmitterOptions, BlacklistOptions */ {
  packFormat: SemVerInput;
}
