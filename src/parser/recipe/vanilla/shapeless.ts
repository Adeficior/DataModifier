import {
  ManyToOneRecipeParser,
  type ManyToOneRecipeDefinition,
} from "../manyToOne";

export type ShapelessRecipeDefinition = ManyToOneRecipeDefinition;

export class ShapelessParser extends ManyToOneRecipeParser<ShapelessRecipeDefinition> {}
