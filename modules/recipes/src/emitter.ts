import type {
  ClearableEmitter,
  Conditions,
  IdInput,
  LoaderContext,
  NormalizedId,
  RegistryProvider,
  SemVerInput,
} from "@adeficior/data-modifier-core";
import {
  CustomEmitter,
  encodeId,
  RuledEmitter,
  withDisabledConditions,
} from "@adeficior/data-modifier-core";
import { createReplacer } from "@adeficior/data-modifier-core/serializer";
import type {
  IngredientFilter,
  IngredientInput,
  IngredientSerializer,
  Predicates,
  ResultInput,
  ResultSerializer,
} from "@adeficior/data-modifier-ingredients";
import type { RecipeSerializerId } from "@adeficior/data-modifier/generated";
import type { Logger } from "@adeficior/pack-resolver";
import { combineResolvers } from "@adeficior/pack-resolver";
import type { Recipe } from "./model";
import type { RecipeFilter, RecipeRules } from "./rule";
import type { RecipeDefinition } from "./schema";
import { recipePath } from "./schema";
import type { RecipesSerializer } from "./serializer/abstract";
import { RecipeHolder } from "./serializer/holder";

export type RecipeEmitter = {
  replaceResult(
    filter: IngredientFilter,
    value: ResultInput,
    additionalFilters?: RecipeFilter,
  ): void;

  replaceIngredient(
    filter: IngredientFilter,
    value: IngredientInput,
    additionalFilters?: RecipeFilter,
  ): void;

  add(id: IdInput, value: RecipeDefinition): NormalizedId;
  add(
    id: IdInput,
    type: IdInput<RecipeSerializerId>,
    value: Recipe,
    conditions?: Conditions,
  ): NormalizedId;

  remove(filter: RecipeFilter): void;
};

export const EMPTY_RECIPE: RecipeDefinition = withDisabledConditions({
  type: "minecraft:disabled",
});

export class RecipeEmitterImpl implements RecipeEmitter, ClearableEmitter {
  private readonly custom = new CustomEmitter<RecipeDefinition>((it) =>
    recipePath(this.packFormat, it),
  );

  private readonly ruled;

  constructor(
    private readonly logger: Logger,
    private readonly packFormat: SemVerInput,
    private readonly registry: RegistryProvider<RecipeHolder>,
    private readonly resultSerializer: ResultSerializer,
    private readonly ingredientSerializer: IngredientSerializer,
    private readonly predicates: Predicates,
    private readonly rules: RecipeRules,
    private readonly serializer: RecipesSerializer,
  ) {
    this.ruled = new RuledEmitter<RecipeHolder>(
      "recipes",
      this.registry,
      (id) => recipePath(packFormat, id),
      EMPTY_RECIPE,
      (it) => this.serializer.serialize(it),
      (id) => this.custom.has(id),
    );
  }

  resolver(context: LoaderContext) {
    return combineResolvers(
      [this.ruled.resolver(context), this.custom.resolver(context)],
      { async: true },
    );
  }

  add(
    id: IdInput,
    arg: RecipeDefinition | IdInput<RecipeSerializerId>,
    arg2?: Recipe,
    conditions?: Conditions,
  ): NormalizedId {
    if (typeof arg === "string" || "namespace" in arg) {
      const holder = RecipeHolder.of(arg, arg2!, conditions);
      const serialized = this.serializer.serialize(holder);
      return this.add(id, serialized);
    } else {
      const value = arg;

      if (this.custom.has(id))
        this.logger.error(`Overwriting custom recipe with ID ${encodeId(id)}`);

      // TODO add to custom registry so recipe graph can use it
      this.custom.add(id, value);
      return encodeId(id);
    }
  }

  remove(filter: RecipeFilter) {
    this.ruled.addRemoval(this.rules.resolve(filter), { filter });
  }

  replaceResult(
    filter: IngredientFilter,
    input: ResultInput,
    additionalFilters?: RecipeFilter,
  ) {
    const value = this.resultSerializer.deserialize(input);

    const replace = createReplacer(this.predicates.result(filter), value);

    this.ruled.addRule(
      this.rules.resolve(additionalFilters, { result: filter }),
      (recipe) => recipe.replaceResult(replace),
      {
        operation: "replace result",
        from: filter,
        to: value,
        filter: additionalFilters,
      },
    );
  }

  replaceIngredient(
    filter: IngredientFilter,
    input: IngredientInput,
    additionalFilters?: RecipeFilter,
  ) {
    const value = this.ingredientSerializer.deserialize(input);
    const replace = createReplacer(this.predicates.ingredient(filter), value);

    this.ruled.addRule(
      this.rules.resolve(additionalFilters, { ingredient: filter }),
      (recipe) => recipe.replaceIngredient(replace),
      {
        operation: "replace ingredient",
        from: filter,
        to: value,
        filter: additionalFilters,
      },
    );
  }

  clear() {
    this.custom.clear();
    this.ruled.clear();
  }
}
