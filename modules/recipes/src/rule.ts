import type { Id, Modifier } from "@adeficior/data-modifier-core";
import { createId, Rule } from "@adeficior/data-modifier-core";
import type { Predicate } from "@adeficior/data-modifier-core/serializer";
import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import type { ContextLike, Logger } from "@adeficior/pack-resolver";
import type { RecipeHolder } from "./serializer/holder";

export class RecipeRule extends Rule<RecipeHolder> {
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

  matches(id: Id, value: RecipeHolder): boolean {
    const types = value.getTypes().map(createId);

    return (
      this.idsTests.every((test) => test(id)) &&
      this.typeTests.every((test) => types.some((it) => test(it))) &&
      this.ingredientTests.every((test) =>
        value.getIngredients().some((it) => test(it)),
      ) &&
      this.resultTests.every((test) =>
        value.getResults().some((it) => test(it)),
      )
    );
  }

  printWarning(logger: Logger) {
    logger.trace("could not find any recipes matching", this.context);
  }
}
