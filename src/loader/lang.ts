import type { Logger } from "@adeficior/pack-resolver";
import type { Id } from "../common/id.js";
import type { LangDefinition } from "../schema/assets/lang.js";
import { LangSchema } from "../schema/assets/lang.js";
import { JsonLoader } from "./index.js";

export default class LangLoader extends JsonLoader<LangDefinition> {
  protected parse(_: Logger, json: unknown, id: Id): LangDefinition | null {
    const parsed = LangSchema.parse(json);
    const existing = this.registry.get(id);
    if (!existing) return parsed;
    return { ...existing, ...parsed };
  }
}
