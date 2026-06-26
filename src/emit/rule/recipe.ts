import type { Logger } from "@adeficior/pack-resolver";
import { exists } from "@adeficior/pack-resolver";
import type { Predicate } from "../../common/filters.js";
import type { Id } from "../../common/id.js";
import { createId } from "../../common/id.js";
import type { Ingredient } from "../../common/ingredient/index.js";
import type { Result } from "../../common/result/index.js";
import type { RecipeHolder } from "../../parser/recipe/index.js";
import type { Modifier } from "./index.js";
import Rule from "./index.js";

export default class RecipeRule extends Rule<RecipeHolder> {
  constructor(
    private readonly shape: unknown[],
    private readonly idsTests: Predicate<Id>[],
    private readonly typeTests: Predicate<Id>[],
    private readonly ingredientTests: Predicate<Ingredient>[],
    private readonly resultTests: Predicate<Result>[],
    modifier: Modifier<RecipeHolder>,
  ) {
    super(modifier);
  }

  matches(id: Id, recipe: RecipeHolder, logger: Logger): boolean {
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
