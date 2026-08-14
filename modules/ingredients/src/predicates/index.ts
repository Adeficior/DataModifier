import type {
  IdInput,
  NormalizedId,
  RegistryLookup,
} from "@adeficior/data-modifier-core";
import { resolveIdTest } from "@adeficior/data-modifier-core/serializer";
import type {
  CommonFilter,
  Predicate,
} from "@adeficior/data-modifier-core/serializer";
import type {
  TagRegistry,
  TagRegistryHolder,
} from "@adeficior/data-modifier-tags";
import type { InferIds, RegistryId } from "@adeficior/data-modifier/generated";
import type { Ingredient } from "../ingredient/impl";
import type { Result } from "../result/impl";
import type { IngredientSerializer } from "../serializer/ingredients";
import { createIngredientPredicate } from "./ingredients";
import type { IngredientFilter } from "./ingredients";

export type Predicates = {
  ingredient(filter: IngredientFilter): Predicate<Ingredient>;
  result(filter: IngredientFilter): Predicate<Result>;
  id<T extends RegistryId>(
    filter: CommonFilter<NormalizedId<InferIds<T>>>,
    registry: T,
  ): Predicate<IdInput<InferIds<T>>>;
};

export function createPredicates(
  registries: RegistryLookup,
  tags: TagRegistryHolder,
  ingredientSerializer: IngredientSerializer,
): Predicates {
  return new PredicatesImpl(registries, tags, ingredientSerializer);
}

class PredicatesImpl implements Predicates {
  constructor(
    // TODO inject
    private readonly registries: RegistryLookup,
    private readonly tags: TagRegistryHolder,
    private readonly ingredientSerializer: IngredientSerializer,
  ) {}

  ingredient(filter: IngredientFilter): Predicate<Ingredient> {
    return createIngredientPredicate(filter, {
      serializer: this.ingredientSerializer,
      registries: this.registries,
      tags: this.tags,
    });
  }

  result(filter: IngredientFilter): Predicate<Result> {
    const ingredientPredicate = this.ingredient(filter);

    return (result, ...args) => {
      const ingredient = result.asIngredient();
      return ingredientPredicate(ingredient, ...args);
    };
  }

  id<T extends RegistryId>(
    filter: CommonFilter<NormalizedId<InferIds<T>>>,
    registry: T | TagRegistry<T>,
  ): Predicate<IdInput<InferIds<T>>> {
    const tags =
      typeof registry == "string" ? this.tags.registry(registry) : registry;
    return resolveIdTest(filter, tags);
  }
}
