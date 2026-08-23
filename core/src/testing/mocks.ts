import { mock } from "bun:test";
import type { RegistryProvider } from "../registry/abstract";
import type { RegistryLookup } from "../registry/lookup";

export function mockRegistryLookup() {
  return {
    addCustom: mock(),
    isKnown: mock(),
    keys: mock(),
    registries: mock(),
    validateEntry: mock(),
  } satisfies RegistryLookup;
}

export function mockRegistryProvider<T>() {
  return {
    forEach: mock(),
    forEachAsync: mock(),
    get: mock(),
  } satisfies RegistryProvider<T>;
}
