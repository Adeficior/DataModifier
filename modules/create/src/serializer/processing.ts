import { ManyToManyRecipeParser } from "@adeficior/data-modifier-recipes";
import type { ManyToManyRecipeDefinition } from "@adeficior/data-modifier-recipes";

export type CreateProcessingRecipeDefinition = ManyToManyRecipeDefinition &
  Readonly<{
    heatRequirement?: string;
    processingTime?: number;
    keepHeldItem?: boolean;
  }>;

export class CreateProcessingRecipeParser extends ManyToManyRecipeParser<CreateProcessingRecipeDefinition> {}
