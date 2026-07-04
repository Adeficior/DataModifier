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
  ToolActionIngredient,
} from ".";
import type RegistryLookup from "../../loader/registry";
import type { SemVerInput } from "../../packFormat";
import {
  IngredientMap,
  type IngredientMapInput,
} from "../../parser/recipe/ingredientMap";
import type { Serializer } from "../../serializer";
import { hasType, isObjectWith } from "../../serializer/checks";
import {
  createSerializerModule,
  type SerializerModule,
} from "../../serializer/module";
import { VersionedSerializer } from "../../serializer/versioned";
import { WrapperSerializer } from "../../serializer/wrapped";
import { AmountSchema, CountSchema } from "../fields";
import { IdSchema, stripTag } from "../id";

const serializer15 = createSerializerModule<Ingredient>((builder) => {
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

export interface IngredientSerializer extends Serializer<
  Ingredient,
  IngredientSerializer
> {
  deserializeIngredientMap(input: IngredientMapInput): IngredientMap;

  serializeIngredientMap(map: IngredientMap): IngredientMapInput;
}
export class IngredientSerializerImpl
  extends VersionedSerializer<Ingredient, IngredientSerializer>
  implements IngredientSerializer
{
  constructor(packFormat: SemVerInput, lookup: RegistryLookup) {
    super(packFormat, lookup, Ingredient, {
      15: serializer15,
    });
  }

  deserializeIngredientMap(input: IngredientMapInput) {
    return new IngredientMap(mapValues(input, (it) => this.deserialize(it)));
  }

  serializeIngredientMap(map: IngredientMap) {
    return mapValues(map.ingredients, (it) => this.serialize(it));
  }

  override withModule(
    module: SerializerModule<Ingredient>,
  ): IngredientSerializer {
    return new WrappedIngredientSerializer(this, module);
  }
}

class WrappedIngredientSerializer extends WrapperSerializer<
  Ingredient,
  IngredientSerializer
> {
  deserializeIngredientMap(input: IngredientMapInput) {
    return this.serializer.deserializeIngredientMap(input);
  }

  serializeIngredientMap(map: IngredientMap) {
    return this.serializer.serializeIngredientMap(map);
  }
}

export function createIngredientSerializer(
  packFormat: SemVerInput,
  lookup: RegistryLookup,
): IngredientSerializer {
  return new IngredientSerializerImpl(packFormat, lookup);
}
