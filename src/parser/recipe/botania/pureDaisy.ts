import * as z from "zod";
import { IdSchema } from "../../../common/id";
import { BlockResult, type Result } from "../../../common/result";
import { isObjectWith } from "../../../serializer/checks";
import { createSerializerModule } from "../../../serializer/module";
import BotaniaBlockRecipeParser, {
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
