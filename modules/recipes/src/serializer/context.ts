import type {
  IngredientSerializer,
  ResultSerializer,
} from "@adeficior/data-modifier-ingredients";
import type { RecipeSerializer } from "./abstract";

export type RecipeParseContext = {
  results: ResultSerializer;
  ingredients: IngredientSerializer;
  recipes: RecipeSerializer;
};
