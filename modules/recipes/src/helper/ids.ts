import { prefix } from "@adeficior/data-modifier-core";
import type { Result } from "@adeficior/data-modifier-ingredients";
import { RegistryEntryResult } from "@adeficior/data-modifier-ingredients";
import { arrayOrSelf } from "@adeficior/pack-resolver";

export function createResultId(result: Result | Result[], pathPrefix?: string) {
  const [first] = arrayOrSelf(result);
  if (!first) throw new Error("cannot create ID from empty result array");

  if (first instanceof RegistryEntryResult) {
    if (pathPrefix) return prefix(first.id, `${pathPrefix}/`);
    return first.id;
  }

  throw new Error(`cannot create default id from result '${first.hashCode()}'`);
}
