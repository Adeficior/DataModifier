import type {
  RecipeDefinition,
  RecipeParseContext,
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

export class BotaniaBlockRecipe extends OneToOneRecipe {}

export class BotaniaBlockRecipeSerializer<
  TDefinition extends BotaniaBlockRecipeDefinition,
> extends RecipeTypeSerializer<TDefinition, BotaniaBlockRecipe> {
  override resultModules() {
    return resultSerializerModules;
  }

  override ingredientModules() {
    return ingredientSerializerModules;
  }

  deserialize(
    definition: TDefinition,
    context: RecipeParseContext,
  ): BotaniaBlockRecipe {
    const ingredient = context.ingredients.deserialize(definition.input);
    const result = context.results.deserialize(definition.output);
    return new BotaniaBlockRecipe(ingredient, result);
  }

  override serialize(recipe: BotaniaBlockRecipe, context: RecipeParseContext) {
    return {
      output: context.results.serialize(recipe.result),
      input: context.ingredients.serialize(recipe.ingredient),
    } as Partial<TDefinition>;
  }
}
