import { encodeId, IdSchema } from "@adeficior/data-modifier-core";
import { IllegalShapeError } from "@adeficior/data-modifier-core/serializer";
import type {
  Result,
  ResultSerializer,
} from "@adeficior/data-modifier-ingredients";
import { ItemResult } from "@adeficior/data-modifier-ingredients";
import type {
  RecipeDefinition,
  RecipeParseContext,
} from "@adeficior/data-modifier-recipes";
import {
  OneToOneRecipe,
  RecipeTypeSerializer,
} from "@adeficior/data-modifier-recipes";
import * as z from "zod";

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

function serializeIdResult(result: Result): unknown {
  if (result instanceof ItemResult) {
    const { id, count } = result;
    return { id: encodeId(id), count };
  }

  throw new IllegalShapeError("recipe can only take item results", result);
}

export type InputOutputRecipeDefinition = RecipeDefinition &
  Readonly<{
    input: unknown;
    output: unknown;
  }>;

export class InputOutputRecipeSerializer extends RecipeTypeSerializer<
  InputOutputRecipeDefinition,
  OneToOneRecipe
> {
  deserialize(
    definition: InputOutputRecipeDefinition,
    context: RecipeParseContext,
  ): OneToOneRecipe {
    const ingredient = context.ingredients.deserialize(definition.input);
    const result = deserializeIdResult(context.results, definition.output);
    return new OneToOneRecipe(ingredient, result);
  }

  override serialize(
    recipe: OneToOneRecipe,
    context: RecipeParseContext,
  ): Partial<InputOutputRecipeDefinition> {
    return {
      input: context.ingredients.serialize(recipe.ingredient),
      output: serializeIdResult(recipe.result),
    };
  }
}
