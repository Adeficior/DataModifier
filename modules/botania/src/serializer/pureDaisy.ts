import { IdSchema } from "@adeficior/data-modifier-core";
import {
  createSerializerModule,
  isObjectWith,
} from "@adeficior/data-modifier-core/serializer";
import type { Result } from "@adeficior/data-modifier-ingredients";
import { BlockResult } from "@adeficior/data-modifier-ingredients";
import * as z from "zod";
import { BotaniaBlockRecipeSerializer } from "./blocks";
import type { BotaniaBlockRecipeDefinition } from "./blocks";

export type PureDaisyRecipeDefinition = BotaniaBlockRecipeDefinition;

const resultSerializer15 = createSerializerModule<Result>((builder) => {
  builder.register(
    BlockResult,
    isObjectWith("name"),
    z.object({
      name: IdSchema,
    }),
    ({ name }) => new BlockResult(name),
    ({ id }) => ({ name: id }),
  );
});

export class PureDaisyRecipeSerializer extends BotaniaBlockRecipeSerializer<PureDaisyRecipeDefinition> {
  override resultModules() {
    return {
      15: resultSerializer15,
    };
  }
}
