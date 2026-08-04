import {
  ManyToOneRecipeParser,
  type ManyToOneRecipeDefinition,
} from "../manyToOne";

export type HammeringRecipeDefinition = ManyToOneRecipeDefinition;

export class HammeringRecipeParser extends ManyToOneRecipeParser<HammeringRecipeDefinition> {}
