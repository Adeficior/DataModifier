import {
  createId,
  isAtLeastVersion,
  jsonFilePattern,
  type IdInput,
  type SemVerInput,
  type WithConditions,
} from "@adeficior/data-modifier-core";
import { type RecipeSerializerId } from "@adeficior/data-modifier/generated";

export type RecipeDefinition = WithConditions<
  Readonly<{
    type: RecipeSerializerId;
    // TODO add neoforge conditions
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
