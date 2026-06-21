import type { Replacer } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";
import type {
  Ingredient,
  IngredientInput,
} from "../../../common/ingredient.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { Result, ResultInput } from "../../../common/result.js";

export type ToolInput = Readonly<{
  type: "farmersdelight:tool_action";
  action: string;
}>;

export type CuttingRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredients: Ingredient[];
    result: Result[];
    tool: Ingredient | ToolInput;
  }>;

function isToolInput<T>(input: T | ToolInput): input is ToolInput {
  return (
    !!input &&
    typeof input === "object" &&
    "type" in input &&
    input.type === "farmersdelight:tool_action"
  );
}

export class CuttingRecipe extends Recipe<CuttingRecipeDefinition> {
  getIngredients(): IngredientInput[] {
    if (isToolInput(this.definition.tool)) return this.definition.ingredients;
    return [...this.definition.ingredients, this.definition.tool];
  }

  getResults(): ResultInput[] {
    return this.definition.result;
  }

  replaceIngredient(replace: Replacer<Ingredient>): Recipe {
    return new CuttingRecipe({
      ...this.definition,
      ingredients: this.definition.ingredients.map(replace),
      tool: isToolInput(this.definition.tool)
        ? this.definition.tool
        : replace(this.definition.tool),
    });
  }

  replaceResult(replace: Replacer<Result>): Recipe {
    return new CuttingRecipe({
      ...this.definition,
      result: this.definition.result.map(replace),
    });
  }
}

export default class CuttingRecipeParser extends RecipeParser<
  CuttingRecipeDefinition,
  CuttingRecipe
> {
  create(definition: CuttingRecipeDefinition): CuttingRecipe {
    return new CuttingRecipe(definition);
  }
}
