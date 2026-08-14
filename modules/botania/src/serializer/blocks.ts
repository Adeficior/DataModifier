import type {
  RecipeDefinition,
  RecipeParseContext,
  SerializedRecipe,
} from "@adeficior/data-modifier-recipes";
import {
  OneToOneRecipe,
  RecipeTypeSerializer,
} from "@adeficior/data-modifier-recipes";
import { ingredientSerializerModules, resultSerializerModules } from "./module";

export type BotaniaBlockRecipeDefinition = RecipeDefinition &
  Readonly<{
    input: unknown;
    output: unknown;
  }>;

export class BotaniaBlockRecipeSerializer extends RecipeTypeSerializer<
  BotaniaBlockRecipeDefinition,
  OneToOneRecipe
> {
  override resultModules() {
    return resultSerializerModules;
  }

  override ingredientModules() {
    return ingredientSerializerModules;
  }

  deserialize(
    definition: BotaniaBlockRecipeDefinition,
    context: RecipeParseContext,
  ): OneToOneRecipe {
    const ingredient = context.ingredients.deserialize(definition.input);
    const result = context.results.deserialize(definition.output);
    return new OneToOneRecipe(ingredient, result);
  }

  override serialize(
    recipe: OneToOneRecipe,
    context: RecipeParseContext,
  ): SerializedRecipe<BotaniaBlockRecipeDefinition> {
    return {
      output: context.results.serialize(recipe.result),
      input: context.ingredients.serialize(recipe.ingredient),
    };
  }
}
