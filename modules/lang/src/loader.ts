import type { Id, Registry } from "@adeficior/data-modifier-core";
import { JsonLoader } from "@adeficior/data-modifier-core";
import type { LangDefinition } from "./schema";
import { LangSchema } from "./schema";

export type LangLoader = Registry<LangDefinition>;

export class LangLoaderImpl
  extends JsonLoader<LangDefinition>
  implements LangLoader
{
  protected parse(json: unknown, id: Id): LangDefinition | null {
    const parsed = LangSchema.parse(json);
    const existing = this.get(id);
    if (!existing) return parsed;
    return { ...existing, ...parsed };
  }
}
