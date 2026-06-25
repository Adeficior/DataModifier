import z from "zod";
import { encodeId, IdSchema } from "../../../common/id.js";
import type {
  BlockLikeIngredient,
  Ingredient,
} from "../../../common/ingredient/index.js";
import {
  BlockIngredient,
  BlockTagIngredient,
} from "../../../common/ingredient/index.js";
import type IngredientSerializer from "../../../common/ingredient/serializer.js";
import type { Result } from "../../../common/result/index.js";
import { BlockResult } from "../../../common/result/index.js";
import type ResultSerializer from "../../../common/result/serializer.js";
import { IllegalShapeError } from "../../../error.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import RecipeParser, { type RecipeParseContext } from "../index.js";
import { OneToOneRecipe } from "../oneToOne.js";

const BlockOutputSchema = z
  .object({
    name: IdSchema,
  })
  .or(IdSchema);

const BlockInputSchema = z
  .object({
    type: z.literal("block"),
    block: IdSchema,
  })
  .or(
    z.object({
      type: z.literal("tag"),
      tag: IdSchema,
    }),
  );

export function serializeBlockInput(ingredient: Ingredient): unknown {
  if (ingredient instanceof BlockIngredient)
    return {
      type: "block",
      block: encodeId(ingredient.id),
    };

  if (ingredient instanceof BlockTagIngredient)
    return {
      type: "tag",
      tag: encodeId(ingredient.tag),
    };

  throw new IllegalShapeError(
    "invalid botania block input ingredient",
    ingredient,
  );
}

export function serializeBlockOutput(result: Result | Ingredient): unknown {
  if (result instanceof BlockResult)
    return {
      name: encodeId(result.id),
    };

  if (result instanceof BlockIngredient)
    return {
      name: encodeId(result.id),
    };

  throw new IllegalShapeError("invalid botania block output result", result);
}

export function deserializeBlockInput(
  ingredients: IngredientSerializer,
  input: unknown,
): BlockLikeIngredient {
  const parsed = BlockInputSchema.parse(input);
  switch (parsed.type) {
    case "block":
      return ingredients.validated(new BlockIngredient(parsed.block));
    case "tag":
      return ingredients.validated(new BlockTagIngredient(parsed.tag));
    default:
      throw new IllegalShapeError(`invalid block input type`, input);
  }
}

export function deserializeBlockOutput(
  results: ResultSerializer,
  output: unknown,
): Result {
  const parsed = BlockOutputSchema.parse(output);
  const id = typeof parsed === "string" ? parsed : parsed.name;
  return results.create(new BlockResult(id));
}

export type BotaniaBlockRecipeDefinition = RecipeDefinition &
  Readonly<{
    input: unknown;
    output: unknown;
  }>;

export class BotaniaBlockRecipe extends OneToOneRecipe {
  override serialize(): Partial<BotaniaBlockRecipeDefinition> {
    return {
      output: serializeBlockOutput(this.result),
      input: serializeBlockOutput(this.ingredient),
    };
  }
}

export default class BotaniaBlockRecipeParser<
  TDefinition extends BotaniaBlockRecipeDefinition,
> extends RecipeParser<TDefinition, BotaniaBlockRecipe> {
  deserialize(
    definition: TDefinition,
    context: RecipeParseContext,
  ): BotaniaBlockRecipe {
    const ingredient = deserializeBlockInput(
      context.ingredients,
      definition.input,
    );
    const result = deserializeBlockOutput(context.results, definition.output);
    return new BotaniaBlockRecipe(ingredient, result);
  }
}
