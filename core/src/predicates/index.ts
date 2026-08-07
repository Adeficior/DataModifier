import {
  type InferIds,
  type RegistryId,
} from "@adeficior/data-modifier/generated";
import { type IdInput, type NormalizedId } from "../common/id";
import { type TagRegistry, type TagRegistryHolder } from "../interface/tags";
import { type Ingredient } from "../io/ingredient/impl";
import { type Result } from "../io/result/impl";
import { type CommonFilter, resolveIdTest, type Predicate } from "./id";
import { type RegistryLookup } from "../registry/lookup";
import { type IngredientSerializer } from "../serializer/ingredients";
import {
  createIngredientPredicate,
  type IngredientFilter,
} from "./ingredients";

export type Predicates = {
  ingredient(filter: IngredientFilter): Predicate<Ingredient>;
  result(filter: IngredientFilter): Predicate<Result>;
  id<T extends RegistryId>(
    filter: CommonFilter<NormalizedId<InferIds<T>>>,
    registry: T,
  ): Predicate<IdInput<InferIds<T>>>;
};

export class PredicatesImpl implements Predicates {
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
