import type { Replacer } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";

import { encodeId } from "../../../common/id.js";
import {
  BlockIngredient,
  BlockTagIngredient,
} from "../../../common/ingredient/index.js";
import type { IngredientInput } from "../../../common/ingredient/input.js";
import type IngredientSerializer from "../../../common/ingredient/serializer.js";
import { BlockResult } from "../../../common/result/index.js";
import type { ResultInput } from "../../../common/result/input.js";
import type ResultSerializer from "../../../common/result/serializer.js";
import { IllegalShapeError } from "../../../error.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";

export type BlockOutput =
  | string
  | Readonly<{
      name: string;
    }>;

export type BlockInput =
  | Readonly<{
      type: "block";
      block: string;
    }>
  | Readonly<{
      type: "tag";
      tag: string;
    }>;

export type OrechidRecipeDefinition = RecipeDefinition &
  Readonly<{
    input: BlockInput;
    output: BlockInput;
    biome_bonus?: number;
    biome_bonus_tag?: string;
    weight?: number;
  }>;

export function createBlockInput(
  ingredients: IngredientSerializer,
  input: IngredientInput,
): BlockInput | null {
  const ingredient = ingredients.create(input);

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

  return null;
}

export function createBlockOutput(
  results: ResultSerializer,
  input: ResultInput,
): BlockOutput | null {
  const result = results.create(input);
  if (result instanceof BlockResult)
    return {
      name: encodeId(result.id),
    };

  return null;
}

export function fromBlockInput(input: BlockInput): BlockIngredient {
  switch (input.type) {
    case "block":
      return {
        block: encodeId(input.block),
      };
    case "tag":
      return {
        blockTag: encodeId(input.tag),
      };
    default:
      throw new IllegalShapeError(`Unknown block input type`, input);
  }
}

export function fromBlockOutput(output: BlockOutput): Block {
  const name = typeof output === "string" ? output : output.name;
  return {
    block: encodeId(name),
  };
}

export class OrechidRecipe extends Recipe<OrechidRecipeDefinition> {
  getIngredients(): IngredientInput[] {
    return [fromBlockInput(this.definition.input)];
  }

  getResults(): ResultInput[] {
    return [fromBlockInput(this.definition.output) as Block];
  }

  replaceIngredient(replace: Replacer<Ingredient>): Recipe {
    return new OrechidRecipe({
      ...this.definition,
      input:
        createBlockInput(replace(fromBlockInput(this.definition.input))) ??
        this.definition.input,
    });
  }

  replaceResult(replace: Replacer<Result>): Recipe {
    return new OrechidRecipe({
      ...this.definition,
      output:
        createBlockInput(
          replace(fromBlockInput(this.definition.output) as Block),
        ) ?? this.definition.output,
    });
  }
}

export default class OrechidRecipeParser extends RecipeParser<
  OrechidRecipeDefinition,
  OrechidRecipe
> {
  create(definition: OrechidRecipeDefinition): OrechidRecipe {
    return new OrechidRecipe(definition);
  }
}
