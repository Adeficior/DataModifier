import { mapValues } from "lodash-es";
import z from "zod";
import {
  BlockIngredient,
  BlockTagIngredient,
  FluidIngredient,
  FluidTagIngredient,
  Ingredient,
  ItemIngredient,
  ItemTagIngredient,
  ListIngredient,
} from ".";
import type RegistryLookup from "../../loader/registry";
import type { SemVerInput } from "../../packFormat";
import {
  IngredientMap,
  type IngredientMapInput,
} from "../../parser/recipe/ingredientMap";
import { AmountSchema, CountSchema } from "../fields";
import { IdSchema, stripTag } from "../id";
import {
  createSerializer,
  isObjectWith,
  VersionedSerializer,
} from "../serializer";

const serializer15 = createSerializer<Ingredient>((builder) => {
  builder.deserializer<string>(
    (it) => typeof it === "string",
    (input) => {
      if (input.startsWith("#")) {
        return new ItemTagIngredient(input);
      }
      return new ItemIngredient(input);
    },
  );

  builder.serializer(ListIngredient, (it, serialize) =>
    it.entries.flatMap(serialize),
  );

  builder.deserializer<unknown[]>(
    Array.isArray,
    (it, deserialize) => new ListIngredient(it.map(deserialize)),
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

export default class IngredientSerializer extends VersionedSerializer<Ingredient> {
  constructor(packFormat: SemVerInput, lookup: RegistryLookup) {
    super(packFormat, lookup, Ingredient, {
      15: serializer15,
    });
  }

  ingredientMap(input: IngredientMapInput) {
    return new IngredientMap(mapValues(input, (it) => this.deserialize(it)));
  }
}
