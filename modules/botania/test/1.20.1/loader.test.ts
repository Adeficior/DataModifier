import type { IdInput } from "@adeficior/data-modifier-core";
import { provided, type DataProvider } from "@adeficior/testing";
import { expect, it } from "bun:test";
import { basename } from "node:path";
import { setupRecipeLoader } from "../../../recipes/test/util/setup";
import { registerParsers } from "../../src/registration";

const version = basename(import.meta.dir);

const { loader, logger } = setupRecipeLoader(version, registerParsers);

function* recipes(): DataProvider<[IdInput]> {
  yield ["mana infusion", "botania:mana_infusion/carrot_to_beetroot_seeds"];
  yield ["elven trade", "botania:elven_trade/dreamwood_log"];
  yield ["marimorphosis", "botania:marimorphosis/metamorphic_swamp_stone"];
  yield ["orechid", "botania:orechid/lapis_ore"];
  yield ["orechid ignem", "botania:orechid_ignem/nether_quartz_ore"];
  yield ["petal apothecary", "botania:petal_apothecary/daffomill"];
  yield ["pure daisy", "botania:pure_daisy/snow_block"];
  yield ["runic altar", "botania:runic_altar/pride"];
  yield ["terra plate", "botania:terra_plate/terrasteel_ingot"];
}

provided("loads recipes", recipes(), (id) => {
  expect(loader.get(id)).toBeDefined();
});

it("has no unknown recipe loaders", () => {
  expect(loader.unknownRecipeTypes().map((it) => it.type)).toBeEmpty();
});

it("does not encounter any errors", () => {
  expect(logger.trace).not.toHaveBeenCalled();
  expect(logger.warn).not.toHaveBeenCalled();
  expect(logger.error).not.toHaveBeenCalled();
});
