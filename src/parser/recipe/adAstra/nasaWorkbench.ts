import {
  ManyToOneRecipeParser,
  type ManyToOneRecipeDefinition,
} from "../manyToOne.js";

export type NasaWorkbenchRecipeDefinition = ManyToOneRecipeDefinition;

export class NasaWorkbenchRecipeParser extends ManyToOneRecipeParser<NasaWorkbenchRecipeDefinition> {}
