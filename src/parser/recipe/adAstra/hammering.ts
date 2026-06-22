import {
  ManyToOneRecipeParser,
  type ManyToOneRecipeDefinition,
} from "../manyToOne.js";

export type HammeringRecipeDefinition = ManyToOneRecipeDefinition;

export class HammeringRecipeParser extends ManyToOneRecipeParser<HammeringRecipeDefinition> {}
