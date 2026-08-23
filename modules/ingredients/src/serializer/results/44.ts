import { IdSchema } from "@adeficior/data-modifier-core";
import {
  createSerializerModule,
  isObjectWith,
} from "@adeficior/data-modifier-core/serializer";
import * as z from "zod";
import { AmountSchema, ChanceSchema, CountSchema } from "../../fields";
import { FluidResult, ItemResult } from "../../result/impl";
import type { Result } from "../../result/impl";
import { commonSerialization } from "./common";

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
