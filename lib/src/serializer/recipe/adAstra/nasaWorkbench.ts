import type { ManyToOneRecipeDefinition } from "@adeficior/data-modifier-recipes/serializer";
import { ManyToManyRecipe } from "@adeficior/data-modifier-recipes/serializer";

export type NasaWorkbenchRecipeDefinition = ManyToOneRecipeDefinition;

export class NasaWorkbenchRecipe extends ManyToManyRecipe {}
