import { IllegalShapeError } from "@adeficior/data-modifier-core/serializer";
import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import type {
  RecipeDefinition,
  RecipeModifier,
  RecipeParseContext,
} from "@adeficior/data-modifier-recipes";
import { Recipe, RecipeTypeSerializer } from "@adeficior/data-modifier-recipes";
import { ingredientSerializerModules } from "./module";

type Writeable<T> = {
  -readonly [P in keyof T]: T[P];
};

export type ThermalRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredient?: unknown;
    ingredients?: unknown[];
    result: unknown;
    energy?: number;
    experience?: number;
  }>;

export class ThermalRecipe extends Recipe {
  constructor(
    readonly ingredients: Ingredient[],
    readonly results: Result[],
  ) {
    super();
  }

  getIngredients() {
    return this.ingredients;
  }

  getResults() {
    return this.results;
  }

  override modify(modifier: RecipeModifier) {
    return new ThermalRecipe(
      this.ingredients.map(modifier.ingredient),
      this.results.map(modifier.result),
    );
  }
}

export class ThermalRecipeSerializer extends RecipeTypeSerializer<
  ThermalRecipeDefinition,
  ThermalRecipe
> {
  override ingredientModules() {
    return ingredientSerializerModules;
  }

  deserialize(
    definition: ThermalRecipeDefinition,
    context: RecipeParseContext,
  ): ThermalRecipe {
    const rawIngredients = definition.ingredient
      ? [definition.ingredient]
      : (definition.ingredients ?? []);

    if (rawIngredients.length === 0)
      throw new IllegalShapeError("ingredients missing or empty", definition);

    const ingredients = context.ingredients.deserializeList(rawIngredients);

    const results = Array.isArray(definition.result)
      ? context.results.deserializeList(definition.result)
      : [context.results.deserialize(definition.result)];

    return new ThermalRecipe(ingredients, results);
  }

  override serialize(
    recipe: ThermalRecipe,
    context: RecipeParseContext,
  ): Partial<ThermalRecipeDefinition> {
    const serialized: Writeable<Partial<ThermalRecipeDefinition>> = {
      result: context.results.serializeList(recipe.results),
    };

    if (recipe.ingredients.length === 1) {
      serialized.ingredient = context.ingredients.serialize(
        recipe.ingredients[0]!,
      );
    } else {
      serialized.ingredients = context.ingredients.serializeList(
        recipe.ingredients,
      );
    }

    return serialized;
  }
}
