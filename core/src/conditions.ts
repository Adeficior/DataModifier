import { notNull } from "@adeficior/pack-resolver";
import { createId } from "./common/id";
import type { Predicate } from "./serializer/predicate";
import { always, any, every, never } from "./serializer/predicate";

export type ForgeCondition = Readonly<{
  type: string;
  [key: string]: unknown;
}>;

export type FabricCondition = Readonly<{
  condition: string;
  [key: string]: unknown;
}>;

export type Conditions = Readonly<{
  conditions?: ForgeCondition[];
  "neoforge:conditions"?: ForgeCondition[];
  "fabric:load_conditions"?: FabricCondition[];
}>;

export type WithConditions<T> = T & Conditions;

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

export function withModLoaded<T>(value: T, mod: string): WithConditions<T> {
  // TODO don't overwrite, append
  return {
    ...value,
    conditions: [{ type: "forge:mod_loaded", mod_id: mod }],
    "neoforge:conditions": [{ type: "neoforge:mod_loaded", mod_id: mod }],
    "fabric:load_conditions": [
      { condition: "fabric:all_mods_loaded", values: [mod] },
    ],
  };
}

export type ConditionContext = {
  mods?: string[];
};

function forgePredicate(
  condition: ForgeCondition,
): Predicate<ConditionContext> {
  const { path } = createId(condition.type);
  if (path === "mod_loaded")
    return ({ mods }) =>
      !notNull(mods) || mods.includes(condition.mod_id as string);
  if (path === "and")
    return every(...(condition.values as ForgeCondition[]).map(forgePredicate));
  if (path === "or")
    return any(...(condition.values as ForgeCondition[]).map(forgePredicate));
  if (path === "false") return never();

  return always();
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
