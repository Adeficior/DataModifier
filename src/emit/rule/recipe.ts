import type { ContextLike, Logger } from "@adeficior/pack-resolver";
import type { Modifier } from ".";
import Rule from ".";
import type { Predicate } from "../../common/filters";
import type { Id } from "../../common/id";
import { createId } from "../../common/id";
import type { Ingredient } from "../../common/ingredient";
import type { Result } from "../../common/result";
import type { RecipeHolder } from "../../parser/recipe";

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
