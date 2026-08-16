import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import type {
  RecipeDefinition,
  RecipeModifier,
} from "@adeficior/data-modifier-recipes";
import type {
  RecipeParseContext,
  SerializedRecipe,
} from "@adeficior/data-modifier-recipes/serializer";
import {
  ManyToOneRecipe,
  RecipeTypeSerializer,
} from "@adeficior/data-modifier-recipes/serializer";

export type ApothecaryRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredients: unknown[];
    output: unknown;
    reagent: unknown;
  }>;

export class ApothecaryRecipe extends ManyToOneRecipe {
  constructor(
    ingredients: Ingredient[],
    result: Result,
    readonly reagent: Ingredient,
  ) {
    super(ingredients, result);
  }

  override getIngredients() {
    return [...super.getIngredients(), this.reagent];
  }

  override modify(modifier: RecipeModifier) {
    return new ApothecaryRecipe(
      this.ingredients.map(modifier.ingredient),
      modifier.result(this.result),
      modifier.ingredient(this.reagent),
    );
  }
}

export class ApothecaryRecipeSerializer extends RecipeTypeSerializer<
  ApothecaryRecipeDefinition,
  ApothecaryRecipe
> {
  deserialize(
    definition: ApothecaryRecipeDefinition,
    context: RecipeParseContext,
  ): ApothecaryRecipe {
    const ingredients = context.ingredients.deserializeList(
      definition.ingredients,
    );
    const result = context.results.deserialize(definition.output);
    const reagent = context.ingredients.deserialize(definition.ingredients);
    return new ApothecaryRecipe(ingredients, result, reagent);
  }

  override serialize(
    recipe: ApothecaryRecipe,
    context: RecipeParseContext,
  ): SerializedRecipe<ApothecaryRecipeDefinition> {
    return {
      ingredients: context.ingredients.serializeList(recipe.ingredients),
      output: context.results.serialize(recipe.result),
      reagent: context.ingredients.serialize(recipe.reagent),
    };
  }
}
