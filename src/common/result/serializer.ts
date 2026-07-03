import z from "zod";
import { BlockResult, FluidResult, ItemResult, Result } from ".";
import type RegistryLookup from "../../loader/registry";
import type { SemVerInput } from "../../packFormat";
import { AmountSchema, ChanceSchema, CountSchema } from "../fields";
import { IdSchema } from "../id";
import {
  createSerializer,
  isObjectWith,
  VersionedSerializer,
} from "../serializer";

const serializer15 = createSerializer<Result>((builder) => {
  builder.deserializer<string>(
    (it) => typeof it === "string",
    (input) => new ItemResult(input),
  );

  builder.register(
    ItemResult,
    isObjectWith("item"),
    z.object({
      item: IdSchema,
      count: CountSchema,
      chance: ChanceSchema,
    }),
    (it) => new ItemResult(it.item, it.count, it.chance),
    ({ id, ...rest }) => ({ item: id, ...rest }),
  );

  builder.register(
    FluidResult,
    isObjectWith("fluid"),
    z.object({
      fluid: IdSchema,
      amount: AmountSchema,
      chance: ChanceSchema,
    }),
    (it) => new FluidResult(it.fluid, it.amount, it.chance),
    ({ id, ...rest }) => ({ fluid: id, ...rest }),
  );

  builder.register(
    BlockResult,
    isObjectWith("block"),
    z.object({
      block: IdSchema,
    }),
    (it) => new BlockResult(it.block),
    ({ id }) => ({ block: id }),
  );
});

export default class ResultSerializer extends VersionedSerializer<Result> {
  constructor(packFormat: SemVerInput, lookup: RegistryLookup) {
    super(packFormat, lookup, Result, {
      15: serializer15,
    });
  }
}
