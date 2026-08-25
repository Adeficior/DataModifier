import type {
  IdInput,
  ResourceFolder,
  SemVerInput,
} from "@adeficior/data-modifier-core";
import {
  isAtLeastVersion,
  jsonFilePath,
  jsonFilePattern,
} from "@adeficior/data-modifier-core";

export function lootTableFolder(packFormat: SemVerInput): ResourceFolder {
  const folder = isAtLeastVersion(packFormat, "44")
    ? "loot_table"
    : "loot_tables";
  return { packType: "data", folder };
}

export function lootTablePath(packFormat: SemVerInput, id: IdInput) {
  return jsonFilePath(lootTableFolder(packFormat), id);
}

export function lootTablePattern(packFormat: SemVerInput) {
  return jsonFilePattern(lootTableFolder(packFormat));
}
