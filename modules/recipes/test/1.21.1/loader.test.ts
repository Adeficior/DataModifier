import { expect, it } from "bun:test";
import { basename } from "node:path";
import { setupRecipeLoader } from "../../src/testing";

const version = basename(import.meta.dir);

const { logger } = setupRecipeLoader(version);

it("does not encounter any errors", () => {
  expect(logger.trace).not.toHaveBeenCalled();
  expect(logger.warn).not.toHaveBeenCalled();
  expect(logger.error).not.toHaveBeenCalled();
});
