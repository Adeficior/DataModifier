import type { ManyToOneRecipeDefinition } from "../manyToOne";
import { ManyToOneRecipeParser } from "../manyToOne";

export type GrindstonePolishingDefinition = ManyToOneRecipeDefinition &
  Readonly<{
    experience?: number;
  }>;

export class GrindstonePolishingParser extends ManyToOneRecipeParser<GrindstonePolishingDefinition> {}
