import { JsonLoader } from "@adeficior/data-modifier-core";
import type { LootTable } from "./schema";
import { LootTableSchema } from "./schema";

export class LootTableLoader extends JsonLoader<LootTable> {
  protected parse(json: unknown): LootTable | null {
    return LootTableSchema.parse(json);
  }
}
