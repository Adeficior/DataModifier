import * as z from "zod";

export const LangSchema = z.record(z.string(), z.string());

export type LangDefinition = z.infer<typeof LangSchema>;
