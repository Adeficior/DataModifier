import type { SemVerInput } from "../packFormat";
import type { IngredientSerializer } from "../serializer/ingredients";
import type { ResultSerializer } from "../serializer/results";
import type RegistryLookup from "./registry";
import type { TagRegistryHolder } from "./tags";

export type PackContext = {
  packFormat: SemVerInput;
  results: ResultSerializer;
  ingredients: IngredientSerializer;
  lookup: RegistryLookup;
  tags: TagRegistryHolder;
};
