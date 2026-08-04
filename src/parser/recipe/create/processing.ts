import type { ManyToManyRecipeDefinition } from "../manyToMany";
import { ManyToManyRecipeParser } from "../manyToMany";

export type CreateProcessingRecipeDefinition = ManyToManyRecipeDefinition &
  Readonly<{
    heatRequirement?: string;
    processingTime?: number;
    keepHeldItem?: boolean;
  }>;

export class CreateProcessingRecipeParser extends ManyToManyRecipeParser<CreateProcessingRecipeDefinition> {}
