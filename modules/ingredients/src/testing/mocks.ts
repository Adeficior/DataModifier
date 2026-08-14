import { type Serializer } from "@adeficior/data-modifier-core/serializer";
import { mock } from "bun:test";
import { type Ingredient } from "../ingredient/impl";
import { type Predicates } from "../predicates";
import { type Result } from "../result/impl";
import { type IngredientSerializer } from "../serializer/ingredients";
import { type ResultSerializer } from "../serializer/results";

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

export function mockPredicates() {
  return {
    id: mock(),
    ingredient: mock(),
    result: mock(),
  } satisfies Predicates;
}
