import { IdSchema, stripTag } from "@adeficior/data-modifier-core";
import {
  createSerializerModule,
  hasType,
  isObjectWith,
} from "@adeficior/data-modifier-core/serializer";
import * as z from "zod";
import { AmountSchema, CountSchema } from "../../fields";
import {
  BlockIngredient,
  BlockTagIngredient,
  FluidIngredient,
  FluidTagIngredient,
  ItemIngredient,
  ItemTagIngredient,
  ToolActionIngredient,
} from "../../ingredient/impl";
import type { Ingredient } from "../../ingredient/impl";
import { commonSerialization } from "./common";

export const serializer15 = createSerializerModule<Ingredient>((builder) => {
  commonSerialization(builder);

  const toolActionType = "farmersdelight:tool_action" as const;
  builder.register(
    ToolActionIngredient,
    hasType(toolActionType),
    z.object({
      type: z.literal(toolActionType),
      action: z.string().nonempty(),
    }),
    (it) => new ToolActionIngredient(it.action),
    ({ action }) => ({ action, type: toolActionType }),
  );

  builder.register(
    ItemTagIngredient,
    isObjectWith("tag"),
    z.object({
      tag: IdSchema,
      count: CountSchema,
    }),
    (it) => new ItemTagIngredient(it.tag, it.count),
    ({ count, tag }) => ({ tag: stripTag(tag), count }),
  );

  builder.register(
    FluidTagIngredient,
    isObjectWith("fluidTag"),
    z.object({
      fluidTag: IdSchema,
      amount: AmountSchema,
    }),
    (it) => new FluidTagIngredient(it.fluidTag, it.amount),
    ({ amount, tag }) => ({ fluidTag: stripTag(tag), amount }),
  );

  builder.register(
    BlockTagIngredient,
    isObjectWith("blockTag"),
    z.object({
      blockTag: IdSchema,
      weight: z.number().optional(),
    }),
    (it) => new BlockTagIngredient(it.blockTag),
    ({ tag }) => ({ blockTag: stripTag(tag) }),
  );

  builder.register(
    ItemIngredient,
    isObjectWith("item"),
    z.object({
      item: IdSchema,
      count: CountSchema,
    }),
    (it) => new ItemIngredient(it.item, it.count),
    ({ id, ...rest }) => ({ item: id, ...rest }),
  );

  builder.register(
    FluidIngredient,
    isObjectWith("fluid"),
    z.object({
      fluid: IdSchema,
      amount: AmountSchema,
    }),
    (it) => new FluidIngredient(it.fluid, it.amount),
    ({ id, ...rest }) => ({ fluid: id, ...rest }),
  );

  builder.register(
    BlockIngredient,
    isObjectWith("block"),
    z.object({
      block: IdSchema,
    }),
    (it) => new BlockIngredient(it.block),
    ({ id }) => ({ block: id }),
  );
});
