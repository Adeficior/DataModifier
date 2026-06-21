import type { Replacer } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";
import type {
  Ingredient,
  IngredientInput,
} from "../../../common/ingredient.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { ResultInput } from "../../../common/result.js";

export type RootComponentRecipeDefinition = RecipeDefinition &
  Readonly<{
    effect: string;
    ingredients: Ingredient[];
  }>;

export class RootComponentRecipe extends Recipe<RootComponentRecipeDefinition> {
  getIngredients(): IngredientInput[] {
    return this.definition.ingredients;
  }

  getResults(): ResultInput[] {
    return [];
  }

  replaceIngredient(replace: Replacer<Ingredient>): Recipe {
    return new RootComponentRecipe({
      ...this.definition,
      ingredients: this.definition.ingredients.map(replace),
    });
  }

  replaceResult(): RootComponentRecipe {
    return new RootComponentRecipe(this.definition);
  }
}

export default class RootComponentRecipeParser extends RecipeParser<
  RootComponentRecipeDefinition,
  RootComponentRecipe
> {
  create(definition: RootComponentRecipeDefinition): RootComponentRecipe {
    return new RootComponentRecipe(definition);
  }
}
