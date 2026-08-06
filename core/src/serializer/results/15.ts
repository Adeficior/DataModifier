import * as z from "zod";
import { IdSchema } from "../../common/id";
import { AmountSchema, ChanceSchema, CountSchema } from "../../io/fields";
import {
  BlockResult,
  FluidResult,
  ItemResult,
  type Result,
} from "../../io/result/impl";
import { isObjectWith } from "../checks";
import { createSerializerModule } from "../module";
import { commonSerialization } from "./common";

export const serializer15 = createSerializerModule<Result>((builder) => {
  commonSerialization(builder);

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
