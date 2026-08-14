import { ManyToOneRecipeParser } from "@adeficior/data-modifier-recipes";
import type { ManyToOneRecipeDefinition } from "@adeficior/data-modifier-recipes";

export type GrindstonePolishingDefinition = ManyToOneRecipeDefinition &
  Readonly<{
    experience?: number;
  }>;

export class GrindstonePolishingParser extends ManyToOneRecipeParser<GrindstonePolishingDefinition> {}
