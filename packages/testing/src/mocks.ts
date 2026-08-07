import type {
  Ingredient,
  IngredientSerializer,
  Result,
  ResultSerializer,
  Serializer,
} from "@adeficior/data-modifier-core";
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

function mockSerializer<R, T extends Serializer<R, T>>() {
  return {
    deserialize: mock(),
    deserializeList: mock(),
    serialize: mock(),
    serializeList: mock(),
    deserializeOptional: mock(),
    serializeOptional: mock(),
    selectModule: mock(),
    validated: mock().mockImplementation((it) => it),
    withModule: mock().mockReturnThis(),
  } satisfies Serializer<R, T>;
}

export function mockResultSerializer() {
  return mockSerializer<Result, ResultSerializer>() satisfies ResultSerializer;
}

export function mockIngredientSerializer() {
  const base = mockSerializer<Ingredient, IngredientSerializer>();
  return {
    ...base,
    deserializeIngredientMap: mock(),
    serializeIngredientMap: mock(),
  } satisfies IngredientSerializer;
}
