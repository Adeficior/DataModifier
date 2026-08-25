import type {
  IdInput,
  ResourceFolder,
  SemVerInput,
  WithConditions,
} from "@adeficior/data-modifier-core";
import {
  isAtLeastVersion,
  jsonFilePath,
  jsonFilePattern,
} from "@adeficior/data-modifier-core";
import type { RecipeSerializerId } from "@adeficior/data-modifier/generated";

export type RecipeDefinition = WithConditions<
  Readonly<{
    type: RecipeSerializerId;
  }>
>;

export function recipeFolder(packFormat: SemVerInput): ResourceFolder {
  const folder = isAtLeastVersion(packFormat, "44") ? "recipe" : "recipes";
  return { packType: "data", folder };
}

export function recipePath(packFormat: SemVerInput, id: IdInput) {
  return jsonFilePath(recipeFolder(packFormat), id);
}

export function recipePattern(packFormat: SemVerInput) {
  return jsonFilePattern(recipeFolder(packFormat));
}
