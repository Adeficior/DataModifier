import type { ManyToOneRecipeDefinition } from "@adeficior/data-modifier-recipes/serializer";
import { ManyToManyRecipe } from "@adeficior/data-modifier-recipes/serializer";

export type HammeringRecipeDefinition = ManyToOneRecipeDefinition;

export class HammeringRecipe extends ManyToManyRecipe {}
