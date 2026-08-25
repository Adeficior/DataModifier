import { createId } from "@adeficior/data-modifier-core";
import type { Id, NormalizedId, Rule } from "@adeficior/data-modifier-core";
import type {
  CommonFilter,
  Predicate,
} from "@adeficior/data-modifier-core/serializer";
import {
  always,
  every,
  resolveIdTest,
  some,
} from "@adeficior/data-modifier-core/serializer";
import type {
  Ingredient,
  IngredientFilter,
  Predicates,
  Result,
} from "@adeficior/data-modifier-ingredients";
import type { RecipeSerializerId } from "@adeficior/data-modifier/generated";
import { notNull } from "@adeficior/pack-resolver";
import type { RecipeHolder } from "./serializer/holder";

class RecipeRule implements Rule<RecipeHolder> {
  constructor(
    private readonly idPredicate: Predicate<Id>,
    private readonly typePredicate: Predicate<Id>,
    private readonly ingredientsPredicate: Predicate<Ingredient[]>,
    private readonly resultsPredicate: Predicate<Result[]>,
  ) {}

  matches(id: Id, value: RecipeHolder): boolean {
    const types = value.getTypes().map(createId);

    return (
      this.idPredicate(id) &&
      types.some((it) => this.typePredicate(it)) &&
      this.ingredientsPredicate(value.getIngredients()) &&
      this.resultsPredicate(value.getResults())
    );
  }
}

export type RecipeFilter = Readonly<{
  id?: CommonFilter<NormalizedId>;
  type?: CommonFilter<NormalizedId<RecipeSerializerId>>;
  namespace?: string;
  output?: IngredientFilter;
  input?: IngredientFilter;
}>;

type SubjectFilters = {
  ingredient?: IngredientFilter;
  result?: IngredientFilter;
};

export type RecipeRules = {
  resolve(
    filter?: RecipeFilter,
    subjectFilters?: SubjectFilters,
  ): Rule<RecipeHolder>;
};

export class RecipeRulesImpl implements RecipeRules {
  constructor(private readonly predicates: Predicates) {}

  private resolveRecipeFilter(test: RecipeFilter) {
    const id: Predicate<Id>[] = [];
    const type: Predicate<Id>[] = [];
    const ingredient: Predicate<Ingredient>[] = [];
    const result: Predicate<Result>[] = [];

    if (test.id) id.push(resolveIdTest(test.id));
    if (test.type) type.push(resolveIdTest(test.type));
    if (test.namespace) id.push((id) => id.namespace === test.namespace);
    if (test.output) result.push(this.predicates.result(test.output));
    if (test.input) ingredient.push(this.predicates.ingredient(test.input));

    return { id, type, ingredient, result };
  }

  private resolveSubjectFilters({ ingredient, result }: SubjectFilters) {
    return {
      ingredient: notNull(ingredient)
        ? this.predicates.ingredient(ingredient)
        : always(),
      result: notNull(result) ? this.predicates.result(result) : always(),
    };
  }

  resolve(filter: RecipeFilter = {}, subjectFilters: SubjectFilters = {}) {
    const recipePredicates = this.resolveRecipeFilter(filter);
    const subjectPredicates = this.resolveSubjectFilters(subjectFilters);

    return new RecipeRule(
      every(recipePredicates.id),
      every(recipePredicates.type),
      every(
        [subjectPredicates.ingredient, ...recipePredicates.ingredient].map(
          some,
        ),
      ),
      every([subjectPredicates.result, ...recipePredicates.result].map(some)),
    );
  }
}
