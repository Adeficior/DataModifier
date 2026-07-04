import z from "zod";
import { encodeId, IdSchema } from "../../../common/id.js";
import type { Ingredient } from "../../../common/ingredient/index.js";
import { ItemResult } from "../../../common/result/index.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { ResultSerializer } from "../../../serializer/results/index.js";
import RecipeParser, {
  Recipe,
  type RecipeModifier,
  type RecipeParseContext,
} from "../index.js";
import { OneToOneRecipe } from "../oneToOne.js";

// TODO this will also be the new item format, can re-use that
const IdResultSchema = z.object({
  id: IdSchema,
  count: z.number().optional(),
});

// TODO create serializer module

function deserializeIdResult(
  results: ResultSerializer,
  input: unknown,
): ItemResult {
  const { id, count } = IdResultSchema.parse(input);
  return results.validated(new ItemResult(id, count));
}

function serializeIdResult(result: ItemResult): unknown {
  const { id, count } = result;
  return { id: encodeId(id), count };
}

export type InputOutputRecipeDefinition = RecipeDefinition &
  Readonly<{
    input: unknown;
    output: unknown;
  }>;

export class InputOutputRecipe extends Recipe {
  constructor(
    protected readonly ingredient: Ingredient,
    protected readonly result: ItemResult,
  ) {
    super();
  }

  getIngredients() {
    return [this.ingredient];
  }

  getResults() {
    return [this.result];
  }

  override modify(modifier: RecipeModifier) {
    return new OneToOneRecipe(
      modifier.ingredient(this.ingredient),
      modifier.result(this.result),
    );
  }

  override serialize(
    context: RecipeParseContext,
  ): Partial<InputOutputRecipeDefinition> {
    return {
      input: context.ingredients.serialize(this.ingredient),
      output: serializeIdResult(this.result),
    };
  }
}

export class InputOutputRecipeParser extends RecipeParser<
  InputOutputRecipeDefinition,
  InputOutputRecipe
> {
  deserialize(
    definition: InputOutputRecipeDefinition,
    context: RecipeParseContext,
  ): InputOutputRecipe {
    const ingredient = context.ingredients.deserialize(definition.input);
    const result = deserializeIdResult(context.results, definition.output);
    return new InputOutputRecipe(ingredient, result);
  }
}
