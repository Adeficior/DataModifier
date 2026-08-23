import type {
  IdInput,
  SemVerInput,
  WithConditions,
} from "@adeficior/data-modifier-core";
import {
  createId,
  isAtLeastVersion,
  jsonFilePattern,
} from "@adeficior/data-modifier-core";
import type { RecipeSerializerId } from "@adeficior/data-modifier/generated";

export type RecipeDefinition = WithConditions<
  Readonly<{
    type: RecipeSerializerId;
  }>
>;

function recipeFolder(packFormat: SemVerInput) {
  return isAtLeastVersion(packFormat, "44") ? "recipe" : "recipes";
}

export function recipePath(packFormat: SemVerInput, id: IdInput) {
  const folder = recipeFolder(packFormat);
  const { namespace, path } = createId(id);
  return `data/${namespace}/${folder}/${path}.json`;
}

export function recipePattern(packFormat: SemVerInput) {
  return jsonFilePattern("data", recipeFolder(packFormat));
}
