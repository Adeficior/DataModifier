import z from "zod";
import { encodeId, IdSchema } from "../../../common/id.js";
import type { Ingredient } from "../../../common/ingredient/index.js";
import type IngredientSerializer from "../../../common/ingredient/serializer.js";
import { ItemResult, type Result } from "../../../common/result/index.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import RecipeParser, {
  Recipe,
  type RecipeParseContext,
  type Replacer,
} from "../index.js";
import { OneToOneRecipe } from "../oneToOne.js";

// TODO this will also be the new item format, can re-use that
const IdResultSchema = z.object({
  id: IdSchema,
  count: z.number().optional(),
});

function deserializeIdResult(
  ingredients: IngredientSerializer,
  input: unknown,
): ItemResult {
  const { id, count } = IdResultSchema.parse(input);
  return ingredients.validated(new ItemResult(id, count));
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
    definition: RecipeDefinition,
    protected readonly ingredient: Ingredient,
    protected readonly result: ItemResult,
  ) {
    super(definition);
  }

  getIngredients() {
    return [this.ingredient];
  }

  getResults() {
    return [this.result];
  }

  override replace(
    ingredientReplacer: Replacer<Ingredient>,
    resultReplacer: Replacer<Result>,
  ) {
    return new OneToOneRecipe(
      this.definition,
      ingredientReplacer(this.ingredient),
      resultReplacer(this.result),
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
    const ingredient = context.ingredients.create(definition.input);
    const result = deserializeIdResult(context.ingredients, definition.output);
    return new InputOutputRecipe(definition, ingredient, result);
  }
}
