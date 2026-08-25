import { mock } from "bun:test";
import type { LootTableRules } from "../rule";

export function mockRules() {
  return {
    resolve: mock(),
  } satisfies LootTableRules;
}
