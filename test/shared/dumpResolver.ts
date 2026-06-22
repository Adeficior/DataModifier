import type { IResolver } from "@adeficior/pack-resolver";
import { createResolver } from "@adeficior/pack-resolver";

export function createDumpResolver(): IResolver {
  return createResolver({ from: "test/resources/dump", silent: true });
}
