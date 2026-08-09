import type { IdInput } from "@adeficior/data-modifier-core";
import { provided, type DataProvider } from "@adeficior/testing";
import { expect, it } from "bun:test";
import { basename } from "node:path";
import { setupRecipeLoader } from "../../../recipes/test/util/setup";
import { registerParsers } from "../../src/registration";

const version = basename(import.meta.dir);

const { loader, logger } = setupRecipeLoader(version, registerParsers);

function* recipes(): DataProvider<[IdInput]> {
  yield ["cutting", "farmersdelight:cutting/blue_orchid"];
  yield ["cooking", "farmersdelight:cooking/pasta_with_mutton_chop"];
  yield [
    "cooking with difference ingredient",
    "farmersdelight:cooking/ratatouille",
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
