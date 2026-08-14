import type { ManyToOneRecipeDefinition } from "@adeficior/data-modifier-recipes";
import { ManyToOneRecipeSerializer } from "@adeficior/data-modifier-recipes";

export type GrindstonePolishingDefinition = ManyToOneRecipeDefinition &
  Readonly<{
    experience?: number;
  }>;

export class GrindstonePolishingSerializer extends ManyToOneRecipeSerializer<GrindstonePolishingDefinition> {}
