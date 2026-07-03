import type { LootTable } from "../schema/data/loot.js";
import { LootTableSchema } from "../schema/data/loot.js";
import { JsonLoader } from "./index.js";

export default class LootTableLoader extends JsonLoader<LootTable> {
  protected parse(json: unknown): LootTable | null {
    return LootTableSchema.parse(json);
  }
}
