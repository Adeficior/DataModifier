import type { PackContext } from "../../loader";
import type { RecipeDefinition } from "../../schema";
import type { RecipeHolder } from "./holder";

export type RecipeSerializer = {
  deserialize(definition: RecipeDefinition): RecipeHolder;
  serialize(recipe: RecipeHolder): RecipeDefinition;
};

export type RecipeParseContext = Pick<
  PackContext,
  "ingredients" | "results"
> & {
  recipes: RecipeSerializer;
};
