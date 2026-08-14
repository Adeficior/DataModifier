import { IdSchema } from "@adeficior/data-modifier-core";
import {
  createSerializerModule,
  isObjectWith,
} from "@adeficior/data-modifier-core/serializer";
import {
  ChanceSchema,
  CountSchema,
  ItemResult,
} from "@adeficior/data-modifier-ingredients";
import type { Result } from "@adeficior/data-modifier-ingredients";
import * as z from "zod";

const chanceResultSchema = z.object({
  chance: ChanceSchema,
  item: z.object({
    id: IdSchema,
    count: CountSchema,
  }),
});

const resultSerializer44 = createSerializerModule<Result>((builder) => {
  builder.register(
    ItemResult,
    isObjectWith("item"),
    chanceResultSchema,
    ({ item, chance }) => new ItemResult(item.id, item.count, chance),
    ({ id, count, chance }) => ({ item: { id, count }, chance }),
  );
});

export const resultSerializerModules = {
  44: resultSerializer44,
};
