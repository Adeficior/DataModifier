import type { ManyToOneRecipeDefinition } from "../manyToOne.js";
import { ManyToOneRecipeParser } from "../manyToOne.js";

export type GrindstonePolishingDefinition = ManyToOneRecipeDefinition &
  Readonly<{
    experience?: number;
  }>;

export class GrindstonePolishingParser extends ManyToOneRecipeParser<GrindstonePolishingDefinition> {}
