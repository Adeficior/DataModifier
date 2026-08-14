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

export type RootComponentRecipeDefinition = RecipeDefinition &
  Readonly<{
    effect: string;
    ingredients: unknown[];
  }>;

export class RootComponentRecipe implements Recipe {
  constructor(
    // TODO this is an ID?
    readonly effect: NormalizedId,
    readonly ingredients: Ingredient[],
  ) {}

  getIngredients() {
    return this.ingredients;
  }

  getResults() {
    return [];
  }

  modify(modifier: RecipeModifier) {
    return new RootComponentRecipe(
      this.effect,
      this.ingredients.map(modifier.ingredient),
    );
  }
}

export class RootComponentRecipeSerializer extends RecipeTypeSerializer<
  RootComponentRecipeDefinition,
  RootComponentRecipe
> {
  deserialize(
    definition: RootComponentRecipeDefinition,
    context: RecipeParseContext,
  ): RootComponentRecipe {
    const ingredients = context.ingredients.deserializeList(
      definition.ingredients,
    );
    return new RootComponentRecipe(encodeId(definition.effect), ingredients);
  }

  override serialize(
    recipe: RootComponentRecipe,
    context: RecipeParseContext,
  ): SerializedRecipe<RootComponentRecipeDefinition> {
    return {
      ingredients: context.ingredients.serializeList(recipe.ingredients),
      effect: recipe.effect,
    };
  }
}
