import type { Writeable } from "zod";
import type { Ingredient } from "../../../common/ingredient/index.js";
import type { Result } from "../../../common/result/index.js";
import { IllegalShapeError } from "../../../error.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { RecipeParseContext, Replacer } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";

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

  replace(
    ingredientReplacer: Replacer<Ingredient>,
    resultReplacer: Replacer<Result>,
  ): Recipe {
    return new ThermalRecipe(
      this.ingredients.map(ingredientReplacer),
      this.results.map(resultReplacer),
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
  deserialize(
    definition: ThermalRecipeDefinition,
    context: RecipeParseContext,
  ): ThermalRecipe {
    // TODO map from and to thermals shape

    const ingredients = definition.ingredient
      ? [context.ingredients.create(definition.ingredient)]
      : context.ingredients.createList(definition.ingredients ?? []);

    if (ingredients.length === 0)
      throw new IllegalShapeError("ingredients missing or empty", definition);

    const results = Array.isArray(definition.result)
      ? context.results.createList(definition.result)
      : [context.results.create(definition.result)];

    return new ThermalRecipe(ingredients, results);
  }
}
