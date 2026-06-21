import type { Replacer } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";
import type {
  Ingredient,
  IngredientInput,
} from "../../../common/ingredient.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { BlockInput, BlockOutput } from "./orechid.js";
import {
  createBlockInput,
  createBlockOutput,
  fromBlockInput,
  fromBlockOutput,
} from "./orechid.js";
import type { Result, ResultInput } from "../../../common/result.js";

export type PureDaisyRecipeDefinition = RecipeDefinition &
  Readonly<{
    input: BlockInput;
    output: BlockOutput;
  }>;

export class PureDaisyRecipe extends Recipe<PureDaisyRecipeDefinition> {
  getIngredients(): IngredientInput[] {
    return [fromBlockInput(this.definition.input)];
  }

  getResults(): ResultInput[] {
    return [fromBlockOutput(this.definition.output)];
  }

  replaceIngredient(replace: Replacer<Ingredient>): Recipe {
    return new PureDaisyRecipe({
      ...this.definition,
      input:
        createBlockInput(replace(fromBlockInput(this.definition.input))) ??
        this.definition.input,
    });
  }

  replaceResult(replace: Replacer<Result>): Recipe {
    return new PureDaisyRecipe({
      ...this.definition,
      output:
        createBlockOutput(replace(fromBlockOutput(this.definition.output))) ??
        this.definition.output,
    });
  }
}

export default class PureDaisyRecipeParser extends RecipeParser<
  PureDaisyRecipeDefinition,
  PureDaisyRecipe
> {
  create(definition: PureDaisyRecipeDefinition): PureDaisyRecipe {
    return new PureDaisyRecipe(definition);
  }
}
