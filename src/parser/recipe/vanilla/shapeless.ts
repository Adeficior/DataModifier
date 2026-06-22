import {
  ManyToOneRecipeParser,
  type ManyToOneRecipeDefinition,
} from "../manyToOne.js";

export type ShapelessRecipeDefinition = ManyToOneRecipeDefinition;

export class ShapelessParser extends ManyToOneRecipeParser<ShapelessRecipeDefinition> {}
