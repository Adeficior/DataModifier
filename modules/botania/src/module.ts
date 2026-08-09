import { defineModule } from "@adeficior/data-modifier-core";
import {
  ShapedParser,
  ShapelessParser,
} from "@adeficior/data-modifier-recipes";
import { name } from "../package.json";
import { ApothecaryRecipeParser } from "./serializer/apothecary";
import { BrewRecipeParser } from "./serializer/brew";
import { ElvenTradeRecipeParser } from "./serializer/elvenTrade";
import { GogWrapperRecipeParser } from "./serializer/gogWrapper";
import { ManaInfusionRecipeParser } from "./serializer/manaInfusion";
import { NbtWrapperRecipeParser } from "./serializer/nbtWrapper";
import { OrechidRecipeParser } from "./serializer/orechid";
import { PureDaisyRecipeParser } from "./serializer/pureDaisy";
import { RunicAltarRecipeParser } from "./serializer/runicAltar";
import { TerraPlateRecipeParser } from "./serializer/terraPlate";

export default defineModule({
  importModule: name,
  dependencies: {
    "@adeficior/data-modifier-recipes": "required",
  },
  setup: (pack) => {
    pack.hook("recipes:register-parser", (event) => {
      event.register(
        "botania:nbt_output_wrapper",
        new NbtWrapperRecipeParser(),
      );
      event.register("botania:orechid", new OrechidRecipeParser());
      event.register("botania:orechid_ignem", new OrechidRecipeParser());
      event.register("botania:marimorphosis", new OrechidRecipeParser());
      event.register("botania:pure_daisy", new PureDaisyRecipeParser());
      event.register(
        "botania:state_copying_pure_daisy",
        new PureDaisyRecipeParser(),
      );
      event.register("botania:mana_upgrade", new ShapedParser());
      event.register(
        "botania:water_bottle_matching_shaped",
        new ShapedParser(),
      );
      event.register("botania:runic_altar", new RunicAltarRecipeParser());
      event.register("botania:runic_altar_head", new RunicAltarRecipeParser());
      event.register("botania:terra_plate", new TerraPlateRecipeParser());
      event.register("botania:elven_trade", new ElvenTradeRecipeParser());
      event.register("botania:brew", new BrewRecipeParser());
      event.register("botania:twig_wand", new ShapedParser());
      event.register("botania:mana_infusion", new ManaInfusionRecipeParser());
      event.register("botania:mana_upgrade_shapeless", new ShapelessParser());
      event.register("botania:armor_upgrade", new ShapedParser());
      event.register("botania:gog_alternation", new GogWrapperRecipeParser());
      event.register("botania:petal_apothecary", new ApothecaryRecipeParser());
    });
  },
});
