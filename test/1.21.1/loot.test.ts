import { describe, expect, it } from "bun:test";
import { basename } from "node:path";
import setupLoader from "../shared/loaderSetup.js";

const version = basename(import.meta.dir);
const { logger } = setupLoader({
  version,
  include: ["data/*/loot_table/**/*.json", "data/*/tags/**/*.json"],
});

describe("loading of loot tables", () => {
  it("loads loot tables without errors", async () => {
    expect(logger.trace).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });
});
