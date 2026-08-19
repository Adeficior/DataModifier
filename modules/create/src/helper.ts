import type { IdInput, NormalizedId } from "@adeficior/data-modifier-core";
import type {
  IngredientInput,
  IngredientSerializer,
  ResultInput,
  ResultSerializer,
} from "@adeficior/data-modifier-ingredients";
import type { RecipeEmitter } from "@adeficior/data-modifier-recipes";
import {
  createResultId,
  withDefaultId,
} from "@adeficior/data-modifier-recipes/helper";
import { ProcessingRecipe } from "./serializer/processing";

export type CreateRecipeHelper = {
  mixing(
    id: IdInput,
    ingredients: IngredientInput[],
    results: ResultInput[],
  ): NormalizedId;
  mixing(ingredients: IngredientInput[], results: ResultInput[]): NormalizedId;
};

export class CreateRecipeHelperImpl implements CreateRecipeHelper {
  constructor(
    private readonly emitter: RecipeEmitter,
    private readonly ingredients: IngredientSerializer,
    private readonly results: ResultSerializer,
  ) {}

  readonly mixing = withDefaultId(
    (
      id: IdInput | null,
      ingredientsInput: IngredientInput[],
      resultsInput: ResultInput[],
    ) => {
      const ingredients = this.ingredients.deserializeList(ingredientsInput);
      const results = this.results.deserializeList(resultsInput);

      return this.emitter.add(
        id ?? createResultId(results),
        "create:mixing",
        new ProcessingRecipe(ingredients, results),
      );
    },
  );
}
