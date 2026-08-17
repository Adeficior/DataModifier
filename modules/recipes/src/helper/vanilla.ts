import {
  encodeId,
  type IdInput,
  type NormalizedId,
} from "@adeficior/data-modifier-core";
import {
  IngredientMap,
  type IngredientInput,
  type IngredientSerializer,
  type ResultInput,
  type ResultSerializer,
} from "@adeficior/data-modifier-ingredients";
import type { RecipeEmitter } from "../emitter";
import { ShapedRecipe } from "../serializer/vanilla/shaped";
import { withDefaultId } from "./factory";

export type VanillaRecipeHelper = {
  shaped(
    id: IdInput,
    ingredients: IngredientInput[][],
    result: ResultInput,
  ): NormalizedId;

  shaped(ingredients: IngredientInput[][], result: ResultInput): NormalizedId;
};

export class VanillaRecipeHelperImpl implements VanillaRecipeHelper {
  constructor(
    private readonly emitter: RecipeEmitter,
    private readonly ingredients: IngredientSerializer,
    private readonly results: ResultSerializer,
  ) {}

  readonly shaped = withDefaultId(
    (
      id: IdInput,
      ingredientInputs: IngredientInput[][],
      resultInput: ResultInput,
    ) => {
      const { pattern, ingredients } = IngredientMap.from(
        ingredientInputs.map((line) =>
          line.map((it) => this.ingredients.deserialize(it)),
        ),
      );

      const result = this.results.deserialize(resultInput);

      this.emitter.add(
        id,
        "minecraft:crafting_shaped",
        new ShapedRecipe(pattern, ingredients, result),
      );

      return encodeId(id);
    },
    () => {
      // TODO encode result
      return "whatever";
    },
  );
}
