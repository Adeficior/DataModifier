import type { RecipeSerializerId } from "@adeficior/data-modifier/generated";
import type { ContextLike, Logger } from "@adeficior/pack-resolver";
import { combineResolvers, notNull } from "@adeficior/pack-resolver";
import type { LoaderContext, RegistryProvider } from "../../common";
import { recipeFolder } from "../../common";
import type { Id, IdInput, NormalizedId } from "../../common/id";
import { encodeId } from "../../common/id";
import type {
  Ingredient,
  IngredientFilter,
  IngredientInput,
  Result,
  ResultInput,
} from "../../io";
import {
  createIngredientPredicate,
  createReplacer,
  createResultPredicate,
  resolveIDTest,
  type CommonFilter,
  type Predicate,
} from "../../io";
import type { PackContext } from "../../loader/context";
import type { RecipeDefinition } from "../../schema/data/recipe";
import {
  RecipeHolder,
  type Recipe,
  type RecipeSerializer,
} from "../../serializer";
import type { ClearableEmitter } from "../abstract";
import { CustomEmitter } from "../custom";
import type { Modifier } from "../rule";
import { RecipeRule } from "../rule/recipe";
import { RuledEmitter } from "../ruled";

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

export const EMPTY_RECIPE: RecipeDefinition = {
  type: "noop",
  conditions: [
    {
      type: "forge:false",
    },
  ],
  "fabric:load_conditions": [
    {
      condition: "fabric:not",
      value: {
        condition: "fabric:all_mods_loaded",
        values: ["minecraft"],
      },
    },
  ],
};

export class RecipeEmitter implements RecipeRules, ClearableEmitter {
  private readonly custom = new CustomEmitter<RecipeDefinition>((it) =>
    this.recipePath(it),
  );

  private readonly ruled: RuledEmitter<RecipeHolder, RecipeRule>;

  constructor(
    private readonly logger: Logger,
    private readonly registry: RegistryProvider<RecipeHolder>,
    private readonly context: PackContext,
    private readonly serializer: RecipeSerializer,
  ) {
    this.ruled = new RuledEmitter<RecipeHolder, RecipeRule>(
      this.registry,
      (id) => this.recipePath(id),
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

  private recipePath(id: Id) {
    const folder = recipeFolder(this.context.packFormat);
    return `data/${id.namespace}/${folder}/${id.path}.json`;
  }

  private createIngredientPredicate(filter?: IngredientFilter) {
    if (!filter) return () => true;
    return createIngredientPredicate(filter, this.context);
  }

  private createResultPredicate(filter?: IngredientFilter) {
    if (!filter) return () => true;
    return createResultPredicate(filter, this.context);
  }

  private resolveRecipeTest(test: RecipeTest) {
    const id: Predicate<Id>[] = [];
    const type: Predicate<Id>[] = [];
    const ingredient: Predicate<Ingredient>[] = [];
    const result: Predicate<Result>[] = [];

    if (test.id) id.push(resolveIDTest(test.id));
    if (test.type) type.push(resolveIDTest(test.type));
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

    const value = this.context.results.deserialize(input);

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

    const value = this.context.ingredients.deserialize(input);

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
