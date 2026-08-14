import type { ManyToOneRecipeDefinition } from "@adeficior/data-modifier-recipes";
import { ManyToManyRecipe } from "@adeficior/data-modifier-recipes";

export type HammeringRecipeDefinition = ManyToOneRecipeDefinition;

export class HammeringRecipe extends ManyToManyRecipe {}
