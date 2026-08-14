import { ManyToOneRecipeParser } from "@adeficior/data-modifier-recipes";
import type { ManyToOneRecipeDefinition } from "@adeficior/data-modifier-recipes";

export type TerraPlateRecipeDefinition = ManyToOneRecipeDefinition &
  Readonly<{
    mana?: number;
  }>;
export class TerraPlateRecipeParser extends ManyToOneRecipeParser<TerraPlateRecipeDefinition> {}
