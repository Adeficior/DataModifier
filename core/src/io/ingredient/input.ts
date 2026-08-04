import type { ItemId } from "@adeficior/data-modifier/generated";
import type { Ingredient } from ".";

export type IngredientInput = ItemId | Ingredient | IngredientInput[];
