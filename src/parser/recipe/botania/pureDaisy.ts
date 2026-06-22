import BotaniaBlockRecipeParser, {
  type BotaniaBlockRecipeDefinition,
} from "./blocks.js";

export type PureDaisyRecipeDefinition = BotaniaBlockRecipeDefinition;

export class PureDaisyRecipeParser extends BotaniaBlockRecipeParser<PureDaisyRecipeDefinition> {}
