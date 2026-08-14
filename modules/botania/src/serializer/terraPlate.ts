import {
  ManyToOneRecipeParser,
  type ManyToOneRecipeDefinition,
} from "@adeficior/data-modifier-recipes";

export type TerraPlateRecipeDefinition = ManyToOneRecipeDefinition &
  Readonly<{
    mana?: number;
  }>;
export class TerraPlateRecipeParser extends ManyToOneRecipeParser<TerraPlateRecipeDefinition> {}
