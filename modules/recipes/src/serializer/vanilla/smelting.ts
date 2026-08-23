import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import type { Recipe } from "../../model";
import type { RecipeDefinition } from "../../schema";
import type { SerializedRecipe } from "../abstract";
import { RecipeTypeSerializer } from "../abstract";
import type { RecipeParseContext } from "../context";
import type { RecipeModifier } from "../modifier";

export type SmeltingRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredient: unknown;
    result: unknown;
    experience?: number;
  }>;

export class SmeltingRecipe implements Recipe {
  constructor(
    readonly ingredient: Ingredient,
    readonly result: Result,
    readonly options: {
      experience?: number;
    } = {},
  ) {}

  getIngredients() {
    return [this.ingredient];
  }

  getResults() {
    return [this.result];
  }

  modify(modifier: RecipeModifier) {
    return new SmeltingRecipe(
      modifier.ingredient(this.ingredient),
      modifier.result(this.result),
      this.options,
    );
  }
}

export class SmeltingSerializer extends RecipeTypeSerializer<
  SmeltingRecipeDefinition,
  SmeltingRecipe
> {
  deserialize(
    definition: SmeltingRecipeDefinition,
    context: RecipeParseContext,
  ): SmeltingRecipe {
    const ingredient = context.ingredients.deserialize(definition.ingredient);
    const result = context.results.deserialize(definition.result);
    const { experience } = definition;
    return new SmeltingRecipe(ingredient, result, { experience });
  }

  override serialize(
    recipe: SmeltingRecipe,
    context: RecipeParseContext,
  ): SerializedRecipe<SmeltingRecipeDefinition> {
    return {
      ingredient: context.ingredients.serialize(recipe.ingredient),
      result: context.results.serialize(recipe.result),
      experience: recipe.options.experience,
    };
  }
}
