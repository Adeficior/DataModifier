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
import { ManaInfusionRecipe } from "./serializer/manaInfusion";

export type BotaniaRecipeHelper = {
  manaInfusion(
    id: IdInput,
    ingredient: IngredientInput,
    result: ResultInput,
  ): NormalizedId;
  manaInfusion(ingredient: IngredientInput, result: ResultInput): NormalizedId;
};

export class BotaniaRecipeHelperImpl implements BotaniaRecipeHelper {
  constructor(
    private readonly emitter: RecipeEmitter,
    private readonly ingredients: IngredientSerializer,
    private readonly results: ResultSerializer,
  ) {}

  readonly manaInfusion: BotaniaRecipeHelper["manaInfusion"] = withDefaultId(
    (
      id: IdInput | null,
      ingredientInput: IngredientInput,
      resultInput: ResultInput,
    ) => {
      const ingredients = this.ingredients.deserialize(ingredientInput);
      const result = this.results.deserialize(resultInput);

      return this.emitter.add(
        id ?? createResultId(result),
        "botania:mana_infusion",
        new ManaInfusionRecipe(ingredients, result),
      );
    },
  );
}
