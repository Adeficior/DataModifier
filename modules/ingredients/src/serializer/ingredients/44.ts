import { IdSchema, stripTag } from "@adeficior/data-modifier-core";
import {
  createSerializerModule,
  hasType,
  isObjectWith,
} from "@adeficior/data-modifier-core/serializer";
import * as z from "zod";
import { AmountSchema, CountSchema } from "../../fields";
import {
  FluidIngredient,
  FluidTagIngredient,
  IgnoredIngredient,
  type Ingredient,
  ItemIngredient,
  ItemTagIngredient,
  ListIngredient,
  ToolActionIngredient,
} from "../../ingredient/impl";
import { commonSerialization } from "./common";

export const serializer44 = createSerializerModule<Ingredient>((builder) => {
  commonSerialization(builder);

  // Do I also need to serialize as this?
  builder.deserializer(hasType("neoforge:compound"), (it, deserialize) => {
    const { children } = z
      .object({
        children: z.array(z.any()),
      })
      .parse(it);

    return new ListIngredient(children.map(deserialize));
  });

  const toolActionType = "farmersdelight:item_ability" as const;
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
    ItemIngredient,
    isObjectWith("item"),
    z.object({
      item: IdSchema,
      count: CountSchema,
    }),
    (it) => new ItemIngredient(it.item, it.count),
    ({ id, ...rest }) => ({ item: id, ...rest }),
  );

  // TODO "type": "neoforge:single",
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

  // TODO add support for these?
  builder.deserializer(
    hasType("neoforge:components"),
    (it) => new IgnoredIngredient(it),
  );

  builder.deserializer(
    hasType("neoforge:intersection"),
    (it) => new IgnoredIngredient(it),
  );

  builder.deserializer(
    hasType("neoforge:difference"),
    (it) => new IgnoredIngredient(it),
  );
});
