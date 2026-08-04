import {
  ManyToOneRecipeParser,
  type ManyToOneRecipeDefinition,
} from "../manyToOne";

export type TerraPlateRecipeDefinition = ManyToOneRecipeDefinition &
  Readonly<{
    mana?: number;
  }>;
export class TerraPlateRecipeParser extends ManyToOneRecipeParser<TerraPlateRecipeDefinition> {}
