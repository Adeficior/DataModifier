import type { RecipeSerializerId } from "@adeficior/data-modifier/generated";

export type ForgeCondition = Readonly<{
  type: string;
  [key: string]: unknown;
}>;
export type FabricCondition = Readonly<{
  condition: string;
  [key: string]: unknown;
}>;

export type RecipeDefinition = Readonly<{
  type: RecipeSerializerId;
  // TODO add neoforge conditions
  conditions?: ForgeCondition[];
  "fabric:load_conditions"?: FabricCondition[];
}>;
