import { ManyToOneRecipeParser } from "@adeficior/data-modifier-recipes";
import type { ManyToOneRecipeDefinition } from "@adeficior/data-modifier-recipes";

export type HammeringRecipeDefinition = ManyToOneRecipeDefinition;

export class HammeringRecipeParser extends ManyToOneRecipeParser<HammeringRecipeDefinition> {}
