import type { IdInput } from "@adeficior/data-modifier-core";
import type {
  IngredientInput,
  IngredientSerializer,
  ResultInput,
  ResultSerializer,
} from "@adeficior/data-modifier-ingredients";
import { IngredientMap } from "@adeficior/data-modifier-ingredients";
import type { RecipeSerializerId } from "@adeficior/data-modifier/generated";
import type { RecipeEmitter } from "../emitter";
import { ShapedRecipe } from "../serializer/vanilla/shaped";
import { withDefaultId } from "./factory";
import type { ShapedHelper } from "./factory";
import { createResultId } from "./ids";

export abstract class AbstractRecipeHelper {
  constructor(
    protected readonly emitter: RecipeEmitter,
    protected readonly ingredients: IngredientSerializer,
    protected readonly results: ResultSerializer,
  ) {}

  protected shapedHelper(type: IdInput<RecipeSerializerId>): ShapedHelper {
    return withDefaultId(
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
          type,
          new ShapedRecipe(pattern, ingredients, result),
        );
      },
    );
  }
}
