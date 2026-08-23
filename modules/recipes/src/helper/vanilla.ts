import type { IdInput, NormalizedId } from "@adeficior/data-modifier-core";
import type {
  IngredientInput,
  IngredientSerializer,
  ResultInput,
  ResultSerializer,
} from "@adeficior/data-modifier-ingredients";
import { IngredientMap } from "@adeficior/data-modifier-ingredients";
import type { RecipeEmitter } from "../emitter";
import { ShapedRecipe } from "../serializer/vanilla/shaped";
import { ShapelessRecipe } from "../serializer/vanilla/shapeless";
import { withDefaultId } from "./factory";
import { createResultId } from "./ids";

export type VanillaRecipeHelper = {
  shaped(
    id: IdInput,
    ingredients: IngredientInput[][],
    result: ResultInput,
  ): NormalizedId;
  shaped(ingredients: IngredientInput[][], result: ResultInput): NormalizedId;

  shapeless(
    id: IdInput,
    ingredients: IngredientInput[],
    result: ResultInput,
  ): NormalizedId;
  shapeless(ingredients: IngredientInput[], result: ResultInput): NormalizedId;
};

export class VanillaRecipeHelperImpl implements VanillaRecipeHelper {
  constructor(
    private readonly emitter: RecipeEmitter,
    private readonly ingredients: IngredientSerializer,
    private readonly results: ResultSerializer,
  ) {}

  readonly shaped: VanillaRecipeHelper["shaped"] = withDefaultId(
    (
      id: IdInput | null,
      ingredientInputs: IngredientInput[][],
      resultInput: ResultInput,
    ) => {
      const { pattern, ingredients } = IngredientMap.from(
        ingredientInputs.map((line) =>
          line.map((it) => this.ingredients.deserialize(it)),
        ),
      );

      const result = this.results.deserialize(resultInput);

      return this.emitter.add(
        id ?? createResultId(result),
        "minecraft:crafting_shaped",
        new ShapedRecipe(pattern, ingredients, result),
      );
    },
  );

  readonly shapeless: VanillaRecipeHelper["shapeless"] = withDefaultId(
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
