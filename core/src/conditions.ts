import { createId } from "./common/id";
import { any, every } from "./serializer/predicate";
import type { Predicate } from "./serializer/predicate";

export type ForgeCondition = Readonly<{
  type: string;
  [key: string]: unknown;
}>;

export type FabricCondition = Readonly<{
  condition: string;
  [key: string]: unknown;
}>;

export type WithConditions<T> = T &
  Readonly<{
    conditions?: ForgeCondition[];
    "neoforge:conditions"?: ForgeCondition[];
    "fabric:load_conditions"?: FabricCondition[];
  }>;

export function withDisabledConditions<T>(value: T): WithConditions<T> {
  return {
    ...value,
    conditions: [
      {
        type: "forge:false",
      },
    ],
    "neoforge:conditions": [
      {
        type: "neoforge:false",
      },
    ],
    "fabric:load_conditions": [
      {
        condition: "fabric:not",
        value: {
          condition: "fabric:all_mods_loaded",
          values: ["minecraft"],
        },
      },
    ],
  };
}

export type ConditionContext = {
  mods: string[];
};

function forgePredicate(
  condition: ForgeCondition,
): Predicate<ConditionContext> {
  const { path } = createId(condition.type);
  if (path === "mod_loaded")
    return ({ mods }) => mods.includes(condition.mod_id as string);
  if (path === "and")
    return every(...(condition.values as ForgeCondition[]).map(forgePredicate));
  if (path === "or")
    return any(...(condition.values as ForgeCondition[]).map(forgePredicate));

  return () => true;
}

export function conditionsPredicate(
  value: WithConditions<unknown>,
): Predicate<ConditionContext> {
  // TODO fabric
  // TODO tests

  return every(
    ...(value["neoforge:conditions"] ?? []).map(forgePredicate),
    ...(value["conditions"] ?? []).map(forgePredicate),
  );
}
