import type { Container } from "../../container";
import { type Predicate } from "../filters";
import {
  createIngredientPredicate,
  type IngredientFilter,
} from "../ingredient/filter";
import type { Result } from "./impl";

export function createResultPredicate(
  test: IngredientFilter,
  container: Container,
): Predicate<Result> {
  const ingredientPredicate = createIngredientPredicate(test, container);

  return (result, ...args) => {
    const ingredient = result.asIngredient();
    return ingredientPredicate(ingredient, ...args);
  };
}
