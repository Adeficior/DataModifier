import {
  type Predicates,
  type RegistryLookup,
  type RegistryProvider,
} from "@adeficior/data-modifier-core";
import { mock } from "bun:test";

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

export function mockPredicates() {
  return {
    id: mock(),
    ingredient: mock(),
    result: mock(),
  } satisfies Predicates;
}
