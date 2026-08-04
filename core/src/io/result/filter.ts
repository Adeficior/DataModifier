import type { Result } from ".";
import type { PackContext } from "../../loader";
import { type Predicate } from "../filters";
import {
  createIngredientPredicate,
  type IngredientFilter,
} from "../ingredient";

export function createResultPredicate(
  test: IngredientFilter,
  context: Pick<PackContext, "ingredients" | "tags" | "lookup">,
): Predicate<Result> {
  const ingredientPredicate = createIngredientPredicate(test, context);

  return (result, ...args) => {
    const ingredient = result.asIngredient();
    return ingredientPredicate(ingredient, ...args);
  };
}
