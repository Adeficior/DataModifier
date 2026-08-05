import { JsonLoader, type Id } from "@adeficior/data-modifier-core";
import { LangSchema, type LangDefinition } from "./schema";

export class LangLoader extends JsonLoader<LangDefinition> {
  protected parse(json: unknown, id: Id): LangDefinition | null {
    const parsed = LangSchema.parse(json);
    const existing = this.get(id);
    if (!existing) return parsed;
    return { ...existing, ...parsed };
  }
}
