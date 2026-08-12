import { type Logger } from "@adeficior/pack-resolver";
import { type SemVerInput } from "./common/packFormat";

export interface PackLoaderOptions {
  packFormat: SemVerInput;
  // TODO make optional
  logger: Logger;
}
