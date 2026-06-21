import type { Replacer } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";
import type {
  Ingredient,
  IngredientInput,
} from "../../../common/ingredient.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { BlockInput } from "./orechid.js";
import { createBlockInput, fromBlockInput } from "./orechid.js";
import type { Result, ResultInput } from "../../../common/result.js";

export type ManaInfusionRecipeDefinition = RecipeDefinition &
  Readonly<{
    input: Ingredient;
    output: Result;
    catalyst?: BlockInput;
    mana?: number;
  }>;

export class ManaInfusionRecipe extends Recipe<ManaInfusionRecipeDefinition> {
  getIngredients(): IngredientInput[] {
    if (!this.definition.catalyst) return [this.definition.input];
    return [fromBlockInput(this.definition.catalyst), this.definition.input];
  }

  getResults(): ResultInput[] {
    return [this.definition.output];
  }

  replaceIngredient(replace: Replacer<Ingredient>): Recipe {
    return new ManaInfusionRecipe({
      ...this.definition,
      input: replace(this.definition.input),
      catalyst:
        (this.definition.catalyst &&
          createBlockInput(
            replace(fromBlockInput(this.definition.catalyst)),
          )) ??
        this.definition.catalyst,
    });
  }

  replaceResult(replace: Replacer<Result>): Recipe {
    return new ManaInfusionRecipe({
      ...this.definition,
      output: replace(this.definition.output),
    });
  }
}

export default class ManaInfusionRecipeParser extends RecipeParser<
  ManaInfusionRecipeDefinition,
  ManaInfusionRecipe
> {
  create(definition: ManaInfusionRecipeDefinition): ManaInfusionRecipe {
    return new ManaInfusionRecipe(definition);
  }
}
