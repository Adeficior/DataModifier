import type { ContextLike, Logger } from "@adeficior/pack-resolver";
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
    private readonly context: ContextLike,
    private readonly idsTests: Predicate<Id>[],
    private readonly typeTests: Predicate<Id>[],
    private readonly ingredientTests: Predicate<Ingredient>[],
    private readonly resultTests: Predicate<Result>[],
    modifier: Modifier<RecipeHolder>,
  ) {
    super(modifier);
  }

  matches(id: Id, recipe: RecipeHolder): boolean {
    const types = recipe.getTypes().map(createId);

    return (
      this.idsTests.every((test) => test(id)) &&
      this.typeTests.every((test) => types.some((it) => test(it))) &&
      this.ingredientTests.every((test) =>
        recipe.getIngredients().some((it) => test(it)),
      ) &&
      this.resultTests.every((test) =>
        recipe.getResults().some((it) => test(it)),
      )
    );
  }

  printWarning(logger: Logger) {
    logger.trace("could not find any recipes matching", this.context);
  }
}
