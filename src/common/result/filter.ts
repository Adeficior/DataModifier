import type { Result } from ".";
import type { PackContext } from "../../loader/context";
import { type Predicate } from "../filters";
import type { IngredientFilter } from "../ingredient/filter";
import createIngredientPredicate from "../ingredient/filter";

export default function createResultFilter(
  test: IngredientFilter,
  context: Pick<PackContext, "ingredients" | "tags" | "lookup">,
): Predicate<Result> {
  const ingredientPredicate = createIngredientPredicate(test, context);

  return (result, ...args) => {
    const ingredient = result.asIngredient();
    return ingredientPredicate(ingredient, ...args);
  };
}
