import { expect, it } from "bun:test";
import { basename } from "node:path";
import setupLoader from "../shared/loaderSetup.js";

const version = basename(import.meta.dir);
const { logger, loader } = setupLoader({
  version,
  include: ["data/**/*.json"],
});

it("has no unknown recipe loaders", () => {
  expect(loader.recipeLoader.unknownRecipeTypes()).toBeEmpty();
});

it("does not encounter any errors", () => {
  expect(logger.trace).not.toHaveBeenCalled();
  expect(logger.warn).not.toHaveBeenCalled();
  expect(logger.error).not.toHaveBeenCalled();
});
