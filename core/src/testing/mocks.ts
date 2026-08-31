import { mock } from "bun:test";
import type { Registry } from "../registry/abstract";
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

export function mockRegistry<T>() {
  return {
    forEach: mock(),
    forEachAsync: mock(),
    get: mock(),
    has: mock(),
    keys: mock(),
    values: mock(),
    entries: mock(),
  } satisfies Registry<T>;
}
