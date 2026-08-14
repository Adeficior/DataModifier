import type { NormalizedId } from "@adeficior/data-modifier-core";
import { encodeId } from "@adeficior/data-modifier-core";
import type { Ingredient } from "@adeficior/data-modifier-ingredients";
import { RecipeTypeSerializer } from "@adeficior/data-modifier-recipes";
import type {
  Recipe,
  RecipeDefinition,
  RecipeModifier,
  RecipeParseContext,
  SerializedRecipe,
} from "@adeficior/data-modifier-recipes";

export type BrewRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredients: unknown[];
    brew: string;
  }>;

export class BrewRecipe implements Recipe {
  constructor(
    // TODO this is an ID?
    readonly brew: NormalizedId,
    readonly ingredients: Ingredient[],
  ) {}

  getIngredients() {
    return this.ingredients;
  }

  getResults() {
    return [];
  }

  modify(modifier: RecipeModifier) {
    return new BrewRecipe(this.brew, this.ingredients.map(modifier.ingredient));
  }
}

export class BrewRecipeSerializer extends RecipeTypeSerializer<
  BrewRecipeDefinition,
  BrewRecipe
> {
  deserialize(
    definition: BrewRecipeDefinition,
    context: RecipeParseContext,
  ): BrewRecipe {
    const ingredients = context.ingredients.deserializeList(
      definition.ingredients,
    );
    const brew = encodeId(definition.brew);
    return new BrewRecipe(brew, ingredients);
  }

  override serialize(
    recipe: BrewRecipe,
    context: RecipeParseContext,
  ): SerializedRecipe<BrewRecipeDefinition> {
    return {
      brew: recipe.brew,
      ingredients: context.ingredients.serializeList(recipe.ingredients),
    };
  }
}
