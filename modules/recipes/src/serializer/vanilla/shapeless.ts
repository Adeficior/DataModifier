import type { ManyToOneRecipeDefinition } from "../manyToOne";
import { ManyToOneRecipeSerializer } from "../manyToOne";

export type ShapelessRecipeDefinition = ManyToOneRecipeDefinition;

export class ShapelessSerializer extends ManyToOneRecipeSerializer<ShapelessRecipeDefinition> {}
