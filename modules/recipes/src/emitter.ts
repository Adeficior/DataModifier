import type {
  ClearableEmitter,
  Conditions,
  Id,
  IdInput,
  LoaderContext,
  Modifier,
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
import type {
  CommonFilter,
  Predicate,
} from "@adeficior/data-modifier-core/serializer";
import {
  createReplacer,
  resolveIdTest,
} from "@adeficior/data-modifier-core/serializer";
import type {
  Ingredient,
  IngredientFilter,
  IngredientInput,
  IngredientSerializer,
  Predicates,
  Result,
  ResultInput,
  ResultSerializer,
} from "@adeficior/data-modifier-ingredients";
import type { RecipeSerializerId } from "@adeficior/data-modifier/generated";
import type { ContextLike, Logger } from "@adeficior/pack-resolver";
import { combineResolvers, notNull } from "@adeficior/pack-resolver";
import type { Recipe } from "./model";
import { RecipeRule } from "./rule";
import type { RecipeDefinition } from "./schema";
import { recipePath } from "./schema";
import type { RecipesSerializer } from "./serializer/abstract";
import { RecipeHolder } from "./serializer/holder";

export type RecipeTest = Readonly<{
  id?: CommonFilter<NormalizedId>;
  type?: CommonFilter<NormalizedId<RecipeSerializerId>>;
  namespace?: string;
  output?: IngredientFilter;
  input?: IngredientFilter;
}>;

export interface RecipeEmitter {
  replaceResult(
    test: IngredientFilter,
    value: ResultInput,
    additionalTests?: RecipeTest,
  ): void;

  replaceIngredient(
    test: IngredientFilter,
    value: IngredientInput,
    additionalTests?: RecipeTest,
  ): void;

  add(id: IdInput, value: RecipeDefinition): void;
  add(
    id: IdInput,
    type: IdInput<RecipeSerializerId>,
    value: Recipe,
    conditions?: Conditions,
  ): void;

  remove(test: RecipeTest): void;
}

export const EMPTY_RECIPE: RecipeDefinition = withDisabledConditions({
  type: "minecraft:disabled",
});

export class RecipeEmitterImpl implements RecipeEmitter, ClearableEmitter {
  private readonly custom = new CustomEmitter<RecipeDefinition>((it) =>
    recipePath(this.packFormat, it),
  );

  private readonly ruled: RuledEmitter<RecipeHolder, RecipeRule>;

  constructor(
    // TODO inject
    private readonly logger: Logger,
    private readonly packFormat: SemVerInput,
    private readonly registry: RegistryProvider<RecipeHolder>,
    private readonly resultSerializer: ResultSerializer,
    private readonly ingredientSerializer: IngredientSerializer,
    private readonly predicates: Predicates,
    private readonly serializer: RecipesSerializer,
  ) {
    this.ruled = new RuledEmitter<RecipeHolder, RecipeRule>(
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

  private createIngredientPredicate(filter?: IngredientFilter) {
    if (!filter) return () => true;
    return this.predicates.ingredient(filter);
  }

  private createResultPredicate(filter?: IngredientFilter) {
    if (!filter) return () => true;
    return this.predicates.result(filter);
  }

  private resolveRecipeTest(test: RecipeTest) {
    const id: Predicate<Id>[] = [];
    const type: Predicate<Id>[] = [];
    const ingredient: Predicate<Ingredient>[] = [];
    const result: Predicate<Result>[] = [];

    if (test.id) id.push(resolveIdTest(test.id));
    if (test.type) type.push(resolveIdTest(test.type));
    if (test.namespace) id.push((id) => id.namespace === test.namespace);
    if (test.output) result.push(this.createResultPredicate(test.output));
    if (test.input) ingredient.push(this.createIngredientPredicate(test.input));

    return { id, type, ingredient, result };
  }

  add(
    id: IdInput,
    arg: RecipeDefinition | IdInput<RecipeSerializerId>,
    arg2?: Recipe,
    conditions?: Conditions,
  ) {
    if (typeof arg === "string" || "namespace" in arg) {
      const holder = RecipeHolder.of(arg, arg2!, conditions);
      const serialized = this.serializer.serialize(holder);
      this.add(id, serialized);
    } else {
      const value = arg;

      if (this.custom.has(id))
        this.logger.error(`Overwriting custom recipe with ID ${encodeId(id)}`);

      // TODO add to custom registry so recipe graph can use it
      this.custom.add(id, value);
    }
  }

  private addRule(
    context: ContextLike,
    modifier: Modifier<RecipeHolder>,
    recipeTest: RecipeTest = {},
    ingredientTests: {
      ingredient?: Predicate<Ingredient>;
      result?: Predicate<Result>;
    } = {},
  ) {
    const recipePredicates = this.resolveRecipeTest(recipeTest ?? {});

    this.ruled.addRule(
      new RecipeRule(
        context,
        recipePredicates.id,
        recipePredicates.type,
        [ingredientTests.ingredient, ...recipePredicates.ingredient].filter(
          notNull,
        ),
        [ingredientTests.result, ...recipePredicates.result].filter(notNull),
        modifier,
      ),
    );
  }

  remove(test: RecipeTest) {
    this.addRule({ operation: "remove", test }, () => null, test);
  }

  replaceResult(
    test: IngredientFilter,
    input: ResultInput,
    additionalTest?: RecipeTest,
  ) {
    const predicate = this.createResultPredicate(test);

    const value = this.resultSerializer.deserialize(input);

    const replace = createReplacer(predicate, value);

    this.addRule(
      {
        operation: "replace result",
        from: test,
        to: value,
        test: additionalTest,
      },
      (recipe) => recipe.replaceResult(replace),
      additionalTest,
      { result: predicate },
    );
  }

  replaceIngredient(
    test: IngredientFilter,
    input: IngredientInput,
    additionalTest?: RecipeTest,
  ) {
    const predicate = this.createIngredientPredicate(test);

    const value = this.ingredientSerializer.deserialize(input);

    const replace = createReplacer(predicate, value);

    this.addRule(
      {
        operation: "replace ingredient",
        from: test,
        to: value,
        test: additionalTest,
      },
      (recipe) => recipe.replaceIngredient(replace),
      additionalTest,
      { ingredient: predicate },
    );
  }

  clear() {
    this.custom.clear();
    this.ruled.clear();
  }
}
