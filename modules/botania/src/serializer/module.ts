import { IdSchema } from "@adeficior/data-modifier-core";
import {
  createSerializerModule,
  hasType,
} from "@adeficior/data-modifier-core/serializer";
import {
  BlockIngredient,
  BlockResult,
  BlockTagIngredient,
} from "@adeficior/data-modifier-ingredients";
import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import * as z from "zod";

const ingredientSerializer15 = createSerializerModule<Ingredient>((builder) => {
  const blockType = "block" as const;
  builder.register(
    BlockIngredient,
    hasType(blockType),
    z.object({
      type: z.literal(blockType),
      block: IdSchema,
    }),
    ({ block }) => new BlockIngredient(block),
    ({ id }) => ({ block: id, type: blockType }),
  );

  const tagType = "tag" as const;
  builder.register(
    BlockTagIngredient,
    hasType(tagType),
    z.object({
      type: z.literal(tagType),
      tag: IdSchema,
    }),
    ({ tag }) => new BlockTagIngredient(tag),
    ({ tag }) => ({ tag, type: tagType }),
  );
});

const resultSerializer15 = createSerializerModule<Result>((builder) => {
  const blockType = "block" as const;
  builder.register(
    BlockResult,
    hasType(blockType),
    z.object({
      type: z.literal(blockType),
      block: IdSchema,
    }),
    ({ block }) => new BlockResult(block),
    ({ id }) => ({ block: id, type: blockType }),
  );
});

export const resultSerializerModules = {
  15: resultSerializer15,
};

export const ingredientSerializerModules = {
  15: ingredientSerializer15,
};
