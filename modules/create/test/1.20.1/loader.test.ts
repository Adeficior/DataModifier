import { provided } from "@adeficior/testing";
import { expect, it } from "bun:test";
import { basename } from "node:path";
import { setupRecipeLoader } from "../../../recipes/test/util/setup";
import { registerParsers } from "../../src/registration";
import { recipesIds } from "../providers/recipeIds";

const version = basename(import.meta.dir);

const { loader, logger } = setupRecipeLoader(version, registerParsers);

provided("loads recipes", recipesIds(), (id) => {
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
