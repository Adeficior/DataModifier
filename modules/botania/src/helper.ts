import type { IdInput, NormalizedId } from "@adeficior/data-modifier-core";
import type {
  IngredientInput,
  ResultInput,
} from "@adeficior/data-modifier-ingredients";
import {
  AbstractRecipeHelper,
  createResultId,
  withDefaultId,
} from "@adeficior/data-modifier-recipes/helper";
import type { ManaInfusionRecipeOptions } from "./serializer/manaInfusion";
import { ManaInfusionRecipe } from "./serializer/manaInfusion";

export type BotaniaRecipeHelper = {
  manaInfusion(
    id: IdInput,
    ingredient: IngredientInput,
    result: ResultInput,
    options?: ManaInfusionRecipeOptions,
  ): NormalizedId;
  manaInfusion(
    ingredient: IngredientInput,
    result: ResultInput,
    options?: ManaInfusionRecipeOptions,
  ): NormalizedId;
};

export class BotaniaRecipeHelperImpl
  extends AbstractRecipeHelper
  implements BotaniaRecipeHelper
{
  readonly manaInfusion: BotaniaRecipeHelper["manaInfusion"] = withDefaultId(
    (
      id: IdInput | null,
      ingredientInput: IngredientInput,
      resultInput: ResultInput,
      options: ManaInfusionRecipeOptions = {},
    ) => {
      const ingredients = this.ingredients.deserialize(ingredientInput);
      const result = this.results.deserialize(resultInput);

      return this.emitter.add(
        id ?? createResultId(result, "mana_infusion"),
        "botania:mana_infusion",
        new ManaInfusionRecipe(ingredients, result, options),
      );
    },
  );
}
