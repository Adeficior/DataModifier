import { arrayOrSelf, exists } from "@adeficior/pack-resolver";
import type {
  Ingredient,
  IngredientInput,
} from "../../../common/ingredient.js";
import type { Result, ResultInput } from "../../../common/result.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { Replacer } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";
import type { ThermalIngredientInput } from "./ingredient.js";
import { fromThermalIngredient, toThermalIngredient } from "./ingredient.js";

export type ThermalRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredient?: ThermalIngredientInput;
    ingredients?: ThermalIngredientInput[];
    result: Result[] | Result;
    energy?: number;
    experience?: number;
  }>;

export class ThermalRecipe extends Recipe<ThermalRecipeDefinition> {
  getIngredients(): IngredientInput[] {
    return [this.definition.ingredient, ...(this.definition.ingredients ?? [])]
      .filter(exists)
      .map(fromThermalIngredient);
  }

  getResults(): ResultInput[] {
    return arrayOrSelf(this.definition.result);
  }

  replaceIngredient(replace: Replacer<Ingredient>): Recipe {
    return new ThermalRecipe({
      ...this.definition,
      ingredient:
        this.definition.ingredient &&
        toThermalIngredient(
          replace(fromThermalIngredient(this.definition.ingredient)),
        ),
      ingredients: this.definition.ingredients
        ?.map(fromThermalIngredient)
        ?.map(replace)
        ?.map(toThermalIngredient),
    });
  }

  replaceResult(replace: Replacer<Result>): Recipe {
    return new ThermalRecipe({
      ...this.definition,
      result: arrayOrSelf(this.definition.result).map(replace),
    });
  }
}

export default class ThermalRecipeParser extends RecipeParser<
  ThermalRecipeDefinition,
  ThermalRecipe
> {
  create(definition: ThermalRecipeDefinition): ThermalRecipe {
    return new ThermalRecipe(definition);
  }
}
