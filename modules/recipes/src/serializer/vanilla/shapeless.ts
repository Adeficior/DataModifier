import { ManyToOneRecipeParser } from "../manyToOne";
import type { ManyToOneRecipeDefinition } from "../manyToOne";

export type ShapelessRecipeDefinition = ManyToOneRecipeDefinition;

export class ShapelessParser extends ManyToOneRecipeParser<ShapelessRecipeDefinition> {}
