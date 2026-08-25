import type { ResourceFolder } from "@adeficior/data-modifier-core";
import * as z from "zod";

export const LangSchema = z.record(z.string(), z.string());

export type LangDefinition = z.infer<typeof LangSchema>;

export function langFolder(): ResourceFolder {
  return { packType: "assets", folder: "lang" };
}
