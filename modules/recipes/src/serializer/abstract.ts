import type { WithSerializerModules } from "@adeficior/data-modifier-ingredients";
import type { Recipe } from "../model";
import type { RecipeDefinition } from "../schema";
import type { RecipeParseContext } from "./context";
import type { RecipeHolder } from "./holder";

export type RecipeSerializer = {
  deserialize(definition: RecipeDefinition): RecipeHolder;
  serialize(recipe: RecipeHolder): RecipeDefinition;
};

export abstract class RecipeTypeSerializer<
  TDefinition extends RecipeDefinition = RecipeDefinition,
  TRecipe extends Recipe = Recipe,
> implements WithSerializerModules {
  ingredientModules() {
    return {};
  }

  resultModules() {
    return {};
  }

  abstract deserialize(
    definition: TDefinition,
    context: RecipeParseContext,
  ): TRecipe;
}
