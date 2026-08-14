import {
  CustomEmitter,
  encodeId,
  RuledEmitter,
  withDisabledConditions,
  type ClearableEmitter,
  type Id,
  type IdInput,
  type LoaderContext,
  type Modifier,
  type NormalizedId,
  type RegistryProvider,
  type SemVerInput,
} from "@adeficior/data-modifier-core";
import {
  createReplacer,
  resolveIdTest,
  type CommonFilter,
  type Predicate,
} from "@adeficior/data-modifier-core/serializer";
import {
  type Ingredient,
  type IngredientFilter,
  type IngredientInput,
  type IngredientSerializer,
  type Predicates,
  type Result,
  type ResultInput,
  type ResultSerializer,
} from "@adeficior/data-modifier-ingredients";
import { type RecipeSerializerId } from "@adeficior/data-modifier/generated";
import {
  combineResolvers,
  notNull,
  type ContextLike,
  type Logger,
} from "@adeficior/pack-resolver";
import { RecipeRule } from "./rule";
import { recipePath, type RecipeDefinition } from "./schema";
import { type Recipe } from "./serializer/abstract";
import { type RecipeSerializer } from "./serializer/context";
import { RecipeHolder } from "./serializer/holder";

export type RecipeTest = Readonly<{
  id?: CommonFilter<NormalizedId>;
  type?: CommonFilter<NormalizedId<RecipeSerializerId>>;
  namespace?: string;
  output?: IngredientFilter;
  input?: IngredientFilter;
  // TODO not sure if I want to even keep this?
  optional?: boolean;
}>;

export interface RecipeRules {
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
  add(id: IdInput, value: RecipeHolder): void;
  add(id: IdInput, type: NormalizedId<RecipeSerializerId>, value: Recipe): void;

  remove(test: RecipeTest): void;
}

export const EMPTY_RECIPE: RecipeDefinition = withDisabledConditions({
  type: "minecraft:disabled",
});

export class RecipeEmitter implements RecipeRules, ClearableEmitter {
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
    private readonly serializer: RecipeSerializer,
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
    arg: RecipeDefinition | RecipeHolder | NormalizedId<RecipeSerializerId>,
    arg2?: Recipe,
  ) {
    if (typeof arg === "string") {
      const type = arg;
      const recipe = arg2!;
      this.add(id, new RecipeHolder({ type }, recipe));
    } else {
      const value = arg;

      if (this.custom.has(id))
        this.logger.error(`Overwriting custom recipe with ID ${encodeId(id)}`);

      if (value instanceof RecipeHolder)
        this.custom.add(id, this.serializer.serialize(value));
      else this.custom.add(id, value);
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
      recipeTest.optional !== true,
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
