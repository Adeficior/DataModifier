import type { ManyToManyRecipeDefinition } from "../manyToMany.js";
import { ManyToManyRecipeParser } from "../manyToMany.js";

export type CreateProcessingRecipeDefinition = ManyToManyRecipeDefinition &
  Readonly<{
    heatRequirement?: string;
    processingTime?: number;
    keepHeldItem?: boolean;
  }>;

export class CreateProcessingRecipeParser extends ManyToManyRecipeParser<CreateProcessingRecipeDefinition> {}
