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
    // TODO add neoforge conditions
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
