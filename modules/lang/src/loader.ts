import type { Id, RegistryProvider } from "@adeficior/data-modifier-core";
import { JsonLoader } from "@adeficior/data-modifier-core";
import type { LangDefinition } from "./schema";
import { LangSchema } from "./schema";

export type LangLoader = RegistryProvider<LangDefinition>;

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
