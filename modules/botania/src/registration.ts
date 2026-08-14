import type { RegisterRecipeSerializer } from "@adeficior/data-modifier-recipes";
import {
  ShapedSerializer,
  ShapelessSerializer,
} from "@adeficior/data-modifier-recipes";
import { ApothecaryRecipeSerializer } from "./serializer/apothecary";
import { BrewRecipeSerializer } from "./serializer/brew";
import { ElvenTradeRecipeSerializer } from "./serializer/elvenTrade";
import { GogWrapperRecipeSerializer } from "./serializer/gogWrapper";
import { ManaInfusionRecipeSerializer } from "./serializer/manaInfusion";
import { NbtWrapperRecipeSerializer } from "./serializer/nbtWrapper";
import { OrechidRecipeSerializer } from "./serializer/orechid";
import { PureDaisyRecipeSerializer } from "./serializer/pureDaisy";
import { RunicAltarRecipeSerializer } from "./serializer/runicAltar";
import { TerraPlateRecipeSerializer } from "./serializer/terraPlate";

export function registerSerializers(event: RegisterRecipeSerializer) {
  event.register(
    "botania:nbt_output_wrapper",
    new NbtWrapperRecipeSerializer(),
  );
  event.register("botania:orechid", new OrechidRecipeSerializer());
  event.register("botania:orechid_ignem", new OrechidRecipeSerializer());
  event.register("botania:marimorphosis", new OrechidRecipeSerializer());
  event.register("botania:pure_daisy", new PureDaisyRecipeSerializer());
  event.register(
    "botania:state_copying_pure_daisy",
    new PureDaisyRecipeSerializer(),
  );
  event.register("botania:mana_upgrade", new ShapedSerializer());
  event.register(
    "botania:water_bottle_matching_shaped",
    new ShapedSerializer(),
  );
  event.register("botania:runic_altar", new RunicAltarRecipeSerializer());
  event.register("botania:runic_altar_head", new RunicAltarRecipeSerializer());
  event.register("botania:terra_plate", new TerraPlateRecipeSerializer());
  event.register("botania:elven_trade", new ElvenTradeRecipeSerializer());
  event.register("botania:brew", new BrewRecipeSerializer());
  event.register("botania:twig_wand", new ShapedSerializer());
  event.register("botania:mana_infusion", new ManaInfusionRecipeSerializer());
  event.register("botania:mana_upgrade_shapeless", new ShapelessSerializer());
  event.register("botania:armor_upgrade", new ShapedSerializer());
  event.register("botania:gog_alternation", new GogWrapperRecipeSerializer());
  event.register("botania:petal_apothecary", new ApothecaryRecipeSerializer());
}
