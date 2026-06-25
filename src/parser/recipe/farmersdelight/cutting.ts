import type { Ingredient } from "../../../common/ingredient/index.js";
import type { Result } from "../../../common/result/index.js";
import RecipeParser, {
  type RecipeModifier,
  type RecipeParseContext,
} from "../index.js";
import {
  ManyToManyRecipe,
  type ManyToManyRecipeDefinition,
} from "../manyToMany.js";

export type ToolInput = Readonly<{
  type: "farmersdelight:tool_action";
  action: string;
}>;

export type CuttingRecipeDefinition = Omit<
  ManyToManyRecipeDefinition,
  "results"
> &
  Readonly<{
    tool: unknown;
    result: ManyToManyRecipeDefinition["results"];
  }>;

// TODO create actual input
// function isToolInput<T>(input: T | ToolInput): input is ToolInput {
//   return (
//     !!input &&
//     typeof input === "object" &&
//     "type" in input &&
//     input.type === "farmersdelight:tool_action"
//   );
// }

export class CuttingRecipe extends ManyToManyRecipe {
  constructor(
    ingredients: Ingredient[],
    results: Result[],
    private readonly tool: Ingredient,
  ) {
    super(ingredients, results);
  }

  override getIngredients() {
    return [...super.getIngredients(), this.tool];
  }

  override replace(modifier: RecipeModifier) {
    return new CuttingRecipe(
      this.ingredients.map(modifier.ingredient),
      this.results.map(modifier.result),
      modifier.ingredient(this.tool),
    );
  }

  override serialize(
    context: RecipeParseContext,
  ): Partial<CuttingRecipeDefinition> {
    const { results, ...rest } = super.serialize(context);
    return {
      ...rest,
      result: results,
      tool: context.ingredients.serialize(this.tool),
    };
  }
}

export default class CuttingRecipeParser extends RecipeParser<
  CuttingRecipeDefinition,
  CuttingRecipe
> {
  deserialize(
    definition: CuttingRecipeDefinition,
    context: RecipeParseContext,
  ): CuttingRecipe {
    const ingredients = context.ingredients.createList(definition.ingredients);
    const result = context.results.createList(definition.result);
    const tool = context.ingredients.create(definition.tool);
    return new CuttingRecipe(ingredients, result, tool);
  }
}
