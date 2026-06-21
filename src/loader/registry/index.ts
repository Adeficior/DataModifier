import type { InferIds, RegistryId } from "@adeficior/data-modifier/generated";
import type { IdInput, NormalizedId } from "../../common/id.js";
import type { Ingredient } from "../../common/ingredient.js";

export default interface RegistryLookup {
  registries(): NormalizedId<RegistryId>[];

  keys<T extends RegistryId>(
    registry: IdInput<T>,
  ): ReadonlySet<NormalizedId<InferIds<T>>> | undefined;

  isKnown(registry: IdInput<RegistryId>): boolean;

  validate(ingredient: Ingredient): void;

  validateEntry(key: RegistryId, id: IdInput): void;

  addCustom<T extends RegistryId>(key: T, id: IdInput): InferIds<T>;
}
