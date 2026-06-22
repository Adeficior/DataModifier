import type { Logger } from "@adeficior/pack-resolver";
import { exists } from "@adeficior/pack-resolver";
import type { Id } from "../../common/id.js";
import { createId } from "../../common/id.js";
import type { IngredientInput, Predicate } from "../../common/ingredient.js";
import type { Recipe } from "../../parser/recipe/index.js";
import type { Modifier } from "./index.js";
import Rule from "./index.js";

export default class RecipeRule extends Rule<Recipe> {
  constructor(
    private readonly shape: unknown[],
    private readonly idsTests: Predicate<Id>[],
    private readonly typeTests: Predicate<Id>[],
    private readonly ingredientTests: Predicate<IngredientInput>[],
    private readonly resultTests: Predicate<IngredientInput>[],
    modifier: Modifier<Recipe>,
  ) {
    super(modifier);
  }

  matches(id: Id, recipe: Recipe, logger: Logger): boolean {
    const types = recipe.getTypes().map(createId);
    return (
      this.idsTests.every((test) => test(id, logger)) &&
      this.typeTests.every((test) => types.some((it) => test(it))) &&
      this.ingredientTests.every((test) =>
        recipe.getIngredients().some((it) => test(it, logger)),
      ) &&
      this.resultTests.every((test) =>
        recipe.getResults().some((it) => test(it, logger)),
      )
    );
  }

  printWarning(logger: Logger) {
    logger.error(
      "Could not find any recipes matching",
      ...this.shape.filter(exists),
    );
  }
}
