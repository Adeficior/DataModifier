import type { ManyToOneRecipeDefinition } from "../manyToOne";
import { ManyToOneRecipe, ManyToOneRecipeSerializer } from "../manyToOne";

export type ShapelessRecipeDefinition = ManyToOneRecipeDefinition;

export class ShapelessRecipe extends ManyToOneRecipe {}

export class ShapelessSerializer extends ManyToOneRecipeSerializer {}
