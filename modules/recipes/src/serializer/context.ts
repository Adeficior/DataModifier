import {
  type IngredientSerializer,
  type ResultSerializer,
} from "@adeficior/data-modifier-ingredients";
import { type RecipeDefinition } from "../schema";
import { type RecipeHolder } from "./holder";

export type RecipeSerializer = {
  deserialize(definition: RecipeDefinition): RecipeHolder;
  serialize(recipe: RecipeHolder): RecipeDefinition;
};

export type RecipeParseContext = {
  results: ResultSerializer;
  ingredients: IngredientSerializer;
  recipes: RecipeSerializer;
};
