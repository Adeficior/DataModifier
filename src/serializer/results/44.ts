import z from "zod";
import { FluidResult, ItemResult, type Result } from "../..";
import { AmountSchema, ChanceSchema, CountSchema } from "../../common/fields";
import { IdSchema } from "../../common/id";
import { isObjectWith } from "../checks";
import { createSerializerModule } from "../module";
import commonSerialization from "./common";

export const serializer44 = createSerializerModule<Result>((builder) => {
  commonSerialization(builder);

  builder.register(
    FluidResult,
    isObjectWith("amount"),
    z.object({
      id: IdSchema,
      amount: AmountSchema,
      chance: ChanceSchema,
    }),
    (it) => new FluidResult(it.id, it.amount, it.chance),
    ({ ...rest }) => ({ ...rest }),
  );

  builder.register(
    ItemResult,
    isObjectWith("id"),
    z.object({
      id: IdSchema,
      count: CountSchema,
      chance: ChanceSchema,
    }),
    (it) => new ItemResult(it.id, it.count, it.chance),
    ({ ...rest }) => ({ ...rest }),
  );
});
