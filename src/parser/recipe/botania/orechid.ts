import BotaniaBlockRecipeParser, {
  type BotaniaBlockRecipeDefinition,
} from "./blocks.js";

export type OrechidRecipeDefinition = BotaniaBlockRecipeDefinition &
  Readonly<{
    biome_bonus?: number;
    biome_bonus_tag?: string;
    weight?: number;
  }>;

export class OrechidRecipeParser extends BotaniaBlockRecipeParser<OrechidRecipeDefinition> {}
