import type {
  IngredientSerializer,
  ResultSerializer,
} from "@adeficior/data-modifier-ingredients";
import type { RecipesSerializer } from "./abstract";

export type RecipeParseContext = {
  results: ResultSerializer;
  ingredients: IngredientSerializer;
  recipes: RecipesSerializer;
};
