import type { IdInput } from "@adeficior/data-modifier-core";
import type { WithSerializerModules } from "@adeficior/data-modifier-ingredients";
import type { RecipeSerializerId } from "@adeficior/data-modifier/generated";
import type { Recipe } from "../model";
import type { RecipeDefinition } from "../schema";
import type { RecipeParseContext } from "./context";
import type { RecipeHolder } from "./holder";

export type RecipesSerializer = {
  deserialize(definition: RecipeDefinition): RecipeHolder;
  serialize(recipe: RecipeHolder): RecipeDefinition;
  get(type: IdInput<RecipeSerializerId>): RecipeTypeSerializer;
};

export type SerializedRecipe<T extends RecipeDefinition> = Omit<
  T,
  keyof RecipeDefinition
>;

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

  abstract serialize(
    recipe: TRecipe,
    context: RecipeParseContext,
  ): SerializedRecipe<TDefinition>;
}
