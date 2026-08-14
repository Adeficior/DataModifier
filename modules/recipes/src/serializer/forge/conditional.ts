import type { Recipe } from "../../model";
import type { RecipeDefinition } from "../../schema";
import { RecipeTypeSerializer } from "../abstract";
import type { SerializedRecipe } from "../abstract";
import type { RecipeParseContext } from "../context";
import type { RecipeHolder } from "../holder";
import type { RecipeModifier } from "../modifier";

type WithConditions<T> = {
  conditions: unknown[];
  recipe: T;
};

export type ForgeConditionalRecipeDefinition = RecipeDefinition &
  Readonly<{
    recipes: WithConditions<RecipeDefinition>[];
  }>;

export class ForgeConditionalRecipe implements Recipe {
  constructor(readonly recipes: WithConditions<RecipeHolder>[]) {}

  getIngredients() {
    return this.recipes.flatMap((it) => it.recipe.getIngredients());
  }

  getResults() {
    return this.recipes.flatMap((it) => it.recipe.getResults());
  }

  modify(modifier: RecipeModifier) {
    return new ForgeConditionalRecipe(
      this.recipes.map((it) => ({
        ...it,
        recipe: it.recipe.modify(modifier),
      })),
    );
  }

  additionalTypes() {
    return this.recipes.flatMap((it) => it.recipe.getTypes());
  }
}

export class ForgeConditionalRecipeSerializer extends RecipeTypeSerializer<
  ForgeConditionalRecipeDefinition,
  ForgeConditionalRecipe
> {
  override deserialize(
    definition: ForgeConditionalRecipeDefinition,
    context: RecipeParseContext,
  ): ForgeConditionalRecipe {
    const recipes = definition.recipes.map<WithConditions<RecipeHolder>>(
      (it) => ({
        conditions: it.conditions,
        recipe: context.recipes.deserialize(it.recipe),
      }),
    );

    return new ForgeConditionalRecipe(recipes);
  }

  override serialize(
    recipe: ForgeConditionalRecipe,
    context: RecipeParseContext,
  ): SerializedRecipe<ForgeConditionalRecipeDefinition> {
    return {
      recipes: recipe.recipes.map((it) => ({
        ...it,
        recipe: context.recipes.serialize(it.recipe),
      })),
    };
  }
}
