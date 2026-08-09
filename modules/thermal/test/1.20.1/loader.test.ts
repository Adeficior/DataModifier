import type { IdInput } from "@adeficior/data-modifier-core";
import { provided, type DataProvider } from "@adeficior/testing";
import { expect, it } from "bun:test";
import { basename } from "node:path";
import { setupRecipeLoader } from "../../../recipes/test/util/setup";
import { registerParsers } from "../../src/registration";

const version = basename(import.meta.dir);

const { loader, logger } = setupRecipeLoader(version, registerParsers);

function* recipes(): DataProvider<[IdInput]> {
  yield ["press", "thermal:machines/press/press_lead_nugget_to_coin"];
  yield ["pulverizer", "thermal:machines/pulverizer/pulverizer_raw_tin"];
  yield ["sawmill", "thermal:machines/sawmill/sawmill_rubberwood_logs"];
  yield ["smelter", "thermal:machines/smelter/smelter_alloy_constantan"];
  yield [
    "tree extractor",
    "thermal:devices/tree_extractor/tree_extractor_rubberwood",
  ];
  yield [
    "numismatic fuel",
    "thermal:fuels/numismatic/numismatic_constantan_coin",
  ];
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
