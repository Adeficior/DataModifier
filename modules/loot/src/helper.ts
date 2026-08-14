import {
  createId,
  isAtLeastVersion,
  jsonFilePattern,
} from "@adeficior/data-modifier-core";
import type { IdInput, SemVerInput } from "@adeficior/data-modifier-core";

function lootTableFolder(packFormat: SemVerInput) {
  return isAtLeastVersion(packFormat, "44") ? "loot_table" : "loot_tables";
}

export function lootTablePath(packFormat: SemVerInput, id: IdInput) {
  const folder = lootTableFolder(packFormat);
  const { namespace, path } = createId(id);
  return `data/${namespace}/${folder}/${path}.json`;
}

export function lootTablePattern(packFormat: SemVerInput) {
  return jsonFilePattern("data", lootTableFolder(packFormat));
}
