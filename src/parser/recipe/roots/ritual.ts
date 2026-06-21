import { exists } from "@adeficior/pack-resolver";
import type {
  Ingredient,
  IngredientInput,
} from "../../../common/ingredient.js";
import type { Result, ResultInput } from "../../../common/result.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { Replacer } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";

export type RootRitualRecipeDefinition = RecipeDefinition &
  Readonly<{
    color: string;
    effect: string;
    level: number;
    incenses?: Ingredient[];
    ingredients?: Ingredient[];
    result?: Result;
  }>;

export class RootRitualRecipe extends Recipe<RootRitualRecipeDefinition> {
  getIngredients(): IngredientInput[] {
    return [
      ...(this.definition.ingredients ?? []),
      ...(this.definition.incenses ?? []),
    ];
  }

  getResults(): ResultInput[] {
    return [this.definition.result].filter(exists);
  }

  replaceIngredient(replace: Replacer<Ingredient>): Recipe {
    return new RootRitualRecipe({
      ...this.definition,
      ingredients: this.definition.ingredients?.map(replace),
      incenses: this.definition.incenses?.map(replace),
    });
  }

  replaceResult(replace: Replacer<Result>): RootRitualRecipe {
    return new RootRitualRecipe({
      ...this.definition,
      result: this.definition.result && replace(this.definition.result),
    });
  }
}

export default class RootRitualRecipeParser extends RecipeParser<
  RootRitualRecipeDefinition,
  RootRitualRecipe
> {
  create(definition: RootRitualRecipeDefinition): RootRitualRecipe {
    return new RootRitualRecipe(definition);
  }
}
