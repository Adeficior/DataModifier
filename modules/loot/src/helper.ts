import {
  isAtLeastVersion,
  type SemVerInput,
} from "@adeficior/data-modifier-core";

export function lootTableFolder(packFormat: SemVerInput) {
  return isAtLeastVersion(packFormat, "44") ? "loot_table" : "loot_tables";
}
