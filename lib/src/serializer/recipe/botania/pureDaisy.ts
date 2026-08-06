import {
  BlockResult,
  createSerializerModule,
  IdSchema,
  isObjectWith,
  type Result,
} from "@adeficior/data-modifier-core";
import * as z from "zod";
import {
  BotaniaBlockRecipeParser,
  type BotaniaBlockRecipeDefinition,
} from "./blocks";

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

export class PureDaisyRecipeParser extends BotaniaBlockRecipeParser<PureDaisyRecipeDefinition> {
  override resultModules() {
    return {
      15: resultSerializer15,
    };
  }
}
