import type { Id } from "../common/id.js";
import { encodeId } from "../common/id.js";
import { tryCatching } from "../error.js";
import type { LootTable } from "../schema/data/loot.js";
import { LootTableSchema } from "../schema/data/loot.js";
import { JsonLoader } from "./index.js";

export default class LootTableLoader extends JsonLoader<LootTable> {
  protected parse(json: unknown, id: Id): LootTable | null {
    return tryCatching(
      this.logger.group(`error parsing loot table ${encodeId(id)}`),
      () => {
        return LootTableSchema.parse(json);
      },
    );
  }
}
