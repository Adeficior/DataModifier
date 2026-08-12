import { describe, expect, it } from "bun:test";
import { basename } from "node:path";
import { setupLootLoader } from "../../src/testing";

const version = basename(import.meta.dir);
const { logger } = setupLootLoader(version);

describe("loading of loot tables", () => {
  it("loads loot tables without errors", async () => {
    expect(logger.trace).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });
});
