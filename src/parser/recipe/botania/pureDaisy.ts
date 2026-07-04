import z from "zod";
import { IdSchema } from "../../../common/id.js";
import { BlockResult, type Result } from "../../../common/result/index.js";
import { isObjectWith } from "../../../serializer/checks.js";
import { createSerializerModule } from "../../../serializer/module.js";
import BotaniaBlockRecipeParser, {
  type BotaniaBlockRecipeDefinition,
} from "./blocks.js";

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
