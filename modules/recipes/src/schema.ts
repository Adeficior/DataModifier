import { type WithConditions } from "@adeficior/data-modifier-core";
import { type RecipeSerializerId } from "@adeficior/data-modifier/generated";

export type RecipeDefinition = WithConditions<
  Readonly<{
    type: RecipeSerializerId;
    // TODO add neoforge conditions
  }>
>;
