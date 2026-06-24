import type { RecipeSerializerId } from "@adeficior/data-modifier/generated";
import type { Acceptor, Logger } from "@adeficior/pack-resolver";
import { exists } from "@adeficior/pack-resolver";
import {
  resolveIDTest,
  type CommonFilter,
  type Predicate,
} from "../../common/filters.js";
import type { Id, IdInput, NormalizedId } from "../../common/id.js";
import { encodeId } from "../../common/id.js";
import type { IngredientFilter } from "../../common/ingredient/filter.js";
import createIngredientFilter from "../../common/ingredient/filter.js";
import type { Ingredient } from "../../common/ingredient/index.js";
import type { IngredientInput } from "../../common/ingredient/input.js";
import type { ResultFilter } from "../../common/result/filter.js";
import createResultFilter from "../../common/result/filter.js";
import type { Result } from "../../common/result/index.js";
import type { ResultInput } from "../../common/result/input.js";
import type { PackContext } from "../../loader/context.js";
import { isAtLeastVersion } from "../../packFormat.js";
import {
  createReplacer,
  RecipeHolder,
  type Recipe,
  type RecipeSerializer,
  type Replacer,
} from "../../parser/recipe/index.js";
import type { RecipeDefinition } from "../../schema/data/recipe.js";
import CustomEmitter from "../custom.js";
import type { ClearableEmitter, RegistryProvider } from "../index.js";
import type { Modifier } from "../rule/index.js";
import RecipeRule from "../rule/recipe.js";
import RuledEmitter from "../ruled.js";

export type RecipeTest = Readonly<{
  id?: CommonFilter<NormalizedId>;
  type?: CommonFilter<NormalizedId<RecipeSerializerId>>;
  namespace?: string;
  output?: ResultFilter;
  input?: IngredientFilter;
  // TODO not sure if I want to even keep this?
  optional?: boolean;
}>;

export interface RecipeRules {
  replaceResult(
    test: ResultFilter,
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

export default class RecipeEmitter implements RecipeRules, ClearableEmitter {
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
      this.logger,
      this.registry,
      (id) => this.recipePath(id),
      EMPTY_RECIPE,
      (it) => this.serializer.serialize(it),
      (id) => this.custom.has(id),
    );
  }

  private recipePath(id: Id) {
    const folder = isAtLeastVersion(this.context.packFormat, "44")
      ? "recipe"
      : "recipes";
    return `data/${id.namespace}/${folder}/${id.path}.json`;
  }

  async emit(acceptor: Acceptor) {
    await Promise.all([this.ruled.emit(acceptor), this.custom.emit(acceptor)]);
  }

  resolveIngredientTest(test?: IngredientFilter) {
    if (!test) return () => true;
    return createIngredientFilter(test, this.context);
  }

  resolveResultTest(test?: ResultFilter) {
    if (!test) return () => true;
    return createResultFilter(test, this.context);
  }

  private resolveRecipeTest(test: RecipeTest) {
    const id: Predicate<Id>[] = [];
    const type: Predicate<Id>[] = [];
    const ingredient: Predicate<IngredientInput>[] = [];
    const result: Predicate<ResultInput>[] = [];

    if (test.id) id.push(resolveIDTest(test.id));
    if (test.type) type.push(resolveIDTest(test.type));
    if (test.namespace) id.push((id) => id.namespace === test.namespace);
    if (test.output) result.push(this.resolveResultTest(test.output));
    if (test.input) ingredient.push(this.resolveIngredientTest(test.input));

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
    shape: unknown[],
    modifier: Modifier<RecipeHolder>,
    recipeTest: RecipeTest = {},
    ingredientTests: {
      ingredient?: Predicate<IngredientInput>;
      result?: Predicate<ResultInput>;
    } = {},
  ) {
    const recipePredicates = this.resolveRecipeTest(recipeTest ?? {});

    this.ruled.addRule(
      new RecipeRule(
        shape,
        recipePredicates.id,
        recipePredicates.type,
        [ingredientTests.ingredient, ...recipePredicates.ingredient].filter(
          exists,
        ),
        [ingredientTests.result, ...recipePredicates.result].filter(exists),
        modifier,
      ),
      recipeTest.optional !== true,
    );
  }

  remove(test: RecipeTest) {
    this.addRule([test], () => null, test);
  }

  replaceResult(
    test: ResultFilter,
    input: ResultInput,
    additionalTest?: RecipeTest,
  ) {
    const predicate = this.resolveResultTest(test);

    const value = this.context.results.create(input);

    const replacer = createReplacer<ResultInput>(predicate, value);
    const replace: Replacer<Result> = (it) =>
      this.context.results.create(replacer(it));

    this.addRule(
      ["replace result", test, "with", value, additionalTest],
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
    const predicate = this.resolveIngredientTest(test);

    const value = this.context.ingredients.create(input);

    const replacer = createReplacer<IngredientInput>(predicate, value);
    const replace: Replacer<Ingredient> = (it) =>
      this.context.ingredients.create(replacer(it));

    this.addRule(
      ["replace ingredient", test, "with", value, additionalTest],
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
