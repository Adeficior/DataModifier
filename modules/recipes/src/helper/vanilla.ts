import type { IdInput } from "@adeficior/data-modifier-core";
import type {
  IngredientInput,
  ResultInput,
} from "@adeficior/data-modifier-ingredients";
import { ShapelessRecipe } from "../serializer/vanilla/shapeless";
import { AbstractRecipeHelper } from "./abstract";
import { withDefaultId } from "./factory";
import type { ManyToOneHelper, ShapedHelper } from "./factory";
import { createResultId } from "./ids";

export type VanillaRecipeHelper = {
  shaped: ShapedHelper;
  shapeless: ManyToOneHelper;
};

export class VanillaRecipeHelperImpl
  extends AbstractRecipeHelper
  implements VanillaRecipeHelper
{
  readonly shaped = this.shapedHelper("minecraft:crafting_shaped");

  readonly shapeless = withDefaultId(
    (
      id: IdInput | null,
      ingredientInputs: IngredientInput[],
      resultInput: ResultInput,
    ) => {
      const ingredients = this.ingredients.deserializeList(ingredientInputs);
      const result = this.results.deserialize(resultInput);

      return this.emitter.add(
        id ?? createResultId(result),
        "minecraft:crafting_shapeless",
        new ShapelessRecipe(ingredients, result),
      );
    },
  );
}
