import {
  ManyToOneRecipeParser,
  type ManyToOneRecipeDefinition,
} from "@adeficior/data-modifier-recipes";

export type NasaWorkbenchRecipeDefinition = ManyToOneRecipeDefinition;

export class NasaWorkbenchRecipeParser extends ManyToOneRecipeParser<NasaWorkbenchRecipeDefinition> {}
