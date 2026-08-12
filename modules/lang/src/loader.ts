import {
  JsonLoader,
  type Id,
  type RegistryProvider,
} from "@adeficior/data-modifier-core";
import { LangSchema, type LangDefinition } from "./schema";

export type LangRegistry = RegistryProvider<LangDefinition>;

export class LangLoader
  extends JsonLoader<LangDefinition>
  implements LangRegistry
{
  protected parse(json: unknown, id: Id): LangDefinition | null {
    const parsed = LangSchema.parse(json);
    const existing = this.get(id);
    if (!existing) return parsed;
    return { ...existing, ...parsed };
  }
}
