import { ManyToOneRecipeSerializer } from "@adeficior/data-modifier-recipes";
import type { ManyToOneRecipeDefinition } from "@adeficior/data-modifier-recipes";

export type NasaWorkbenchRecipeDefinition = ManyToOneRecipeDefinition;

export class NasaWorkbenchRecipeSerializer extends ManyToOneRecipeSerializer<NasaWorkbenchRecipeDefinition> {}
