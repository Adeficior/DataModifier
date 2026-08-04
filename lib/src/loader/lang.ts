import { JsonLoader } from ".";
import type { Id } from "../common/id";
import type { LangDefinition } from "../schema/assets/lang";
import { LangSchema } from "../schema/assets/lang";

export class LangLoader extends JsonLoader<LangDefinition> {
  protected parse(json: unknown, id: Id): LangDefinition | null {
    const parsed = LangSchema.parse(json);
    const existing = this.get(id);
    if (!existing) return parsed;
    return { ...existing, ...parsed };
  }
}
