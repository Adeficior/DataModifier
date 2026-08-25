import { mock } from "bun:test";
import type { RecipeRules } from "../rule";

export function mockRules() {
  return {
    resolve: mock(),
  } satisfies RecipeRules;
}
