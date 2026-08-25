import type {
  IdInput,
  NormalizedId,
  RegistryLookup,
} from "@adeficior/data-modifier-core";
import type {
  CommonFilter,
  Predicate,
} from "@adeficior/data-modifier-core/serializer";
import type {
  IdFilterContext,
  TagRegistries,
} from "@adeficior/data-modifier-tags";
import { resolveIdFilter } from "@adeficior/data-modifier-tags";
import type { InferIds, RegistryId } from "@adeficior/data-modifier/generated";
import { notNull } from "@adeficior/pack-resolver";
import type { Ingredient } from "../ingredient/impl";
import type { Result } from "../result/impl";
import type { IngredientSerializer } from "../serializer/ingredients";
import type { IngredientFilter } from "./ingredients";
import { createIngredientPredicate } from "./ingredients";

export type Predicates = {
  ingredient(filter: IngredientFilter): Predicate<Ingredient>;
  result(filter: IngredientFilter): Predicate<Result>;
  id(filter: CommonFilter<NormalizedId>): Predicate<IdInput>;
  id<T extends RegistryId>(
    filter: CommonFilter<NormalizedId<InferIds<T>>>,
    registry: T,
  ): Predicate<IdInput<InferIds<T>>>;
};

export function createPredicates(
  registries: RegistryLookup,
  tags: TagRegistries,
  ingredientSerializer: IngredientSerializer,
): Predicates {
  return new PredicatesImpl(registries, tags, ingredientSerializer);
}

class PredicatesImpl implements Predicates {
  constructor(
    private readonly registries: RegistryLookup,
    private readonly tags: TagRegistries,
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
    registry?: T,
  ): Predicate<IdInput<InferIds<T>>> {
    const context = notNull(registry)
      ? ({
          tags: this.tags.registry(registry),
          lookup: this.registries,
          registry,
        } satisfies IdFilterContext<T>)
      : undefined;

    return resolveIdFilter(filter, context);
  }
}
