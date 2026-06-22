import type IngredientSerializer from "../common/ingredient/serializer";
import type ResultSerializer from "../common/result/serializer";
import type { SemVerInput } from "../packFormat";
import type RegistryLookup from "./registry";
import type { TagRegistryHolder } from "./tags";

export type PackContext = {
  packFormat: SemVerInput;
  results: ResultSerializer;
  ingredients: IngredientSerializer;
  lookup: RegistryLookup;
  tags: TagRegistryHolder;
};
