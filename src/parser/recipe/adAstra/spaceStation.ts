import type { Replacer } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";
import type {
  Ingredient,
  IngredientInput,
} from "../../../common/ingredient.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { ResultInput } from "../../../common/result.js";
import type { WrappedIngredient } from "./index.js";

export type SpaceStationRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredients: WrappedIngredient[];
    mana?: number;
  }>;

export class SpaceStationRecipe extends Recipe<SpaceStationRecipeDefinition> {
  getIngredients(): IngredientInput[] {
    return this.definition.ingredients.map((it) => it.ingredient);
  }

  getResults(): ResultInput[] {
    return [];
  }

  replaceIngredient(replace: Replacer<Ingredient>): Recipe {
    return new SpaceStationRecipe({
      ...this.definition,
      ingredients: this.definition.ingredients.map((it) => ({
        ...it,
        ingredient: replace(it.ingredient),
      })),
    });
  }

  replaceResult(): Recipe {
    return new SpaceStationRecipe(this.definition);
  }
}

export default class SpaceStationRecipeParser extends RecipeParser<
  SpaceStationRecipeDefinition,
  SpaceStationRecipe
> {
  create(definition: SpaceStationRecipeDefinition): SpaceStationRecipe {
    return new SpaceStationRecipe(definition);
  }
}
