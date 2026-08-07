import { type ItemId } from "@adeficior/data-modifier/generated";
import { type Ingredient } from "./impl";

export type IngredientInput = ItemId | Ingredient | IngredientInput[];
