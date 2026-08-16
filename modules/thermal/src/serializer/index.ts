import { IllegalShapeError } from "@adeficior/data-modifier-core/serializer";
import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import type {
  Recipe,
  RecipeDefinition,
  RecipeModifier,
} from "@adeficior/data-modifier-recipes";
import type {
  RecipeParseContext,
  SerializedRecipe,
} from "@adeficior/data-modifier-recipes/serializer";
import { RecipeTypeSerializer } from "@adeficior/data-modifier-recipes/serializer";
import { ingredientSerializerModules } from "./module";

type Writeable<T> = {
  -readonly [P in keyof T]: T[P];
};

export type ThermalRecipeOptions = Readonly<{
  energy?: number;
  experience?: number;
}>;

export type ThermalRecipeDefinition = RecipeDefinition &
  ThermalRecipeOptions &
  Readonly<{
    ingredient?: unknown;
    ingredients?: unknown[];
    result: unknown;
  }>;

export class ThermalRecipe implements Recipe {
  constructor(
    readonly ingredients: Ingredient[],
    readonly results: Result[],
    readonly options: ThermalRecipeOptions = {},
  ) {}

  getIngredients() {
    return this.ingredients;
  }

  getResults() {
    return this.results;
  }

  modify(modifier: RecipeModifier) {
    return new ThermalRecipe(
      this.ingredients.map(modifier.ingredient),
      this.results.map(modifier.result),
      this.options,
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

    return new ThermalRecipe(ingredients, results, {
      energy: definition.energy,
      experience: definition.experience,
    });
  }

  override serialize(
    recipe: ThermalRecipe,
    context: RecipeParseContext,
  ): SerializedRecipe<ThermalRecipeDefinition> {
    const serialized: Writeable<SerializedRecipe<ThermalRecipeDefinition>> = {
      result: context.results.serializeList(recipe.results),
      ...recipe.options,
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
