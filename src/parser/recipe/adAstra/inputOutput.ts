import type { Replacer } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";
import type {
  Ingredient,
  IngredientInput,
} from "../../../common/ingredient.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { Result, ResultInput } from "../../../common/result.js";

export type IdResult = {
  id: string;
  count?: number;
};

export function fromIdResult({ id, ...result }: IdResult): Result {
  return {
    item: id,
    ...result,
  };
}

export function toIdResult(result: Result): IdResult | null {
  if ("item" in result)
    return {
      id: result.item,
      count: result.count,
    };

  return null;
}

export type InputOutputRecipeDefinition = RecipeDefinition &
  Readonly<{
    input: Ingredient;
    output: IdResult;
  }>;

export class InputOutputRecipe extends Recipe<InputOutputRecipeDefinition> {
  getIngredients(): IngredientInput[] {
    return [this.definition.input];
  }

  getResults(): ResultInput[] {
    return [this.definition.output].map(fromIdResult);
  }

  replaceIngredient(replace: Replacer<Ingredient>): Recipe {
    return new InputOutputRecipe({
      ...this.definition,
      input: replace(this.definition.input),
    });
  }

  replaceResult(replace: Replacer<Result>): Recipe {
    return new InputOutputRecipe({
      ...this.definition,
      output:
        toIdResult(replace(fromIdResult(this.definition.output))) ??
        this.definition.output,
    });
  }
}

export default class InputOutputRecipeParser extends RecipeParser<
  InputOutputRecipeDefinition,
  InputOutputRecipe
> {
  create(definition: InputOutputRecipeDefinition): InputOutputRecipe {
    return new InputOutputRecipe(definition);
  }
}
