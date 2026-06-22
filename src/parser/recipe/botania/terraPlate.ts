import {
  ManyToOneRecipeParser,
  type ManyToOneRecipeDefinition,
} from "../manyToOne.js";

export type ShapelessRecipeDefinition = ManyToOneRecipeDefinition;
export type TerraPlateRecipeDefinition = ManyToOneRecipeDefinition &
  Readonly<{
    mana?: number;
  }>;
export class TerraPlateRecipeParser extends ManyToOneRecipeParser<TerraPlateRecipeDefinition> {}
