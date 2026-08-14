import { ManyToOneRecipeSerializer } from "@adeficior/data-modifier-recipes";
import type { ManyToOneRecipeDefinition } from "@adeficior/data-modifier-recipes";

export type HammeringRecipeDefinition = ManyToOneRecipeDefinition;

export class HammeringRecipeSerializer extends ManyToOneRecipeSerializer<HammeringRecipeDefinition> {}
