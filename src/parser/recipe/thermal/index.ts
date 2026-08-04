import type { RecipeModifier, RecipeParseContext } from "..";
import RecipeParser, { Recipe } from "..";
import type { Ingredient } from "../../../common/ingredient";
import type { Result } from "../../../common/result";
import { IllegalShapeError } from "../../../error";
import type { RecipeDefinition } from "../../../schema/data/recipe";
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
    private readonly ingredients: Ingredient[],
    private readonly results: Result[],
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

  override serialize(
    context: RecipeParseContext,
  ): Partial<ThermalRecipeDefinition> {
    const serialized: Writeable<Partial<ThermalRecipeDefinition>> = {
      result: context.results.serializeList(this.results),
    };

    if (this.ingredients.length === 1) {
      serialized.ingredient = context.ingredients.serialize(
        this.ingredients[0]!,
      );
    } else {
      serialized.ingredients = context.ingredients.serializeList(
        this.ingredients,
      );
    }

    return serialized;
  }
}

export class ThermalRecipeParser extends RecipeParser<
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
}
