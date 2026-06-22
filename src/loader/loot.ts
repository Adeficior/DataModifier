import type { Logger } from "@adeficior/pack-resolver";
import type { Id } from "../common/id.js";
import { encodeId } from "../common/id.js";
import { tryCatching } from "../error.js";
import type { LootTable } from "../schema/data/loot.js";
import { LootTableSchema } from "../schema/data/loot.js";
import { JsonLoader } from "./index.js";

export default class LootTableLoader extends JsonLoader<LootTable> {
  protected parse(logger: Logger, json: unknown, id: Id): LootTable | null {
    return tryCatching(
      logger.group(`error parsing loot table ${encodeId(id)}`),
      () => {
        return LootTableSchema.parse(json);
      },
    );
  }
}
