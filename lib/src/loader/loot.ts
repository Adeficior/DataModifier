import { JsonLoader } from ".";
import type { LootTable } from "../schema/data/loot";
import { LootTableSchema } from "../schema/data/loot";

export class LootTableLoader extends JsonLoader<LootTable> {
  protected parse(json: unknown): LootTable | null {
    return LootTableSchema.parse(json);
  }
}
