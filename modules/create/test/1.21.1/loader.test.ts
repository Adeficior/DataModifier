import { setupRecipeLoader } from "@adeficior/data-modifier-recipes/testing";
import { provided } from "@adeficior/testing";
import { expect, it } from "bun:test";
import { basename } from "node:path";
import { recipeOptions } from "../options";
import { recipesIds } from "../providers/recipeIds";

const version = basename(import.meta.dir);

const { loader, logger } = setupRecipeLoader(version, recipeOptions);

provided("loads recipes", recipesIds(), (id) => {
  expect(loader.get(id)).toBeDefined();
});

it("does not encounter any errors", () => {
  expect(logger.trace).not.toHaveBeenCalled();
  expect(logger.warn).not.toHaveBeenCalled();
  expect(logger.error).not.toHaveBeenCalled();
});
