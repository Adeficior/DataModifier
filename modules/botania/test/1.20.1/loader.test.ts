import { expect, it } from "bun:test";
import { basename } from "node:path";
import { setupRecipeLoader } from "../../../recipes/test/util/setup";

const version = basename(import.meta.dir);

const { loader, logger } = setupRecipeLoader(version);

it("loads recipes", () => {
  loader.get("botania:");
});

it("has no unknown recipe loaders", () => {
  expect(loader.unknownRecipeTypes().map((it) => it.type)).toBeEmpty();
});

it("does not encounter any errors", () => {
  expect(logger.trace).not.toHaveBeenCalled();
  expect(logger.warn).not.toHaveBeenCalled();
  expect(logger.error).not.toHaveBeenCalled();
});
