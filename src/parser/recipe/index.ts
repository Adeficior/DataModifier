import { encodeId, type NormalizedId } from "../../common/id.js";
import type { Ingredient } from "../../common/ingredient/index.js";
import type { Predicate } from "../../common/predicates.js";
import type { Result } from "../../common/result/index.js";
import type { PackContext } from "../../loader/context.js";
import type { RecipeDefinition } from "../../schema/data/recipe.js";

export type Replacer<T> = (value: T) => T;

export function createReplacer<T>(from: Predicate<T>, to: T): Replacer<T> {
  return (it: T) => {
    if (from(it)) return to;
    return it;
  };
}

function keep<T>(): Replacer<T> {
  return (t) => t;
}

export class RecipeHolder {
  private readonly type: NormalizedId;

  constructor(
    private readonly definition: RecipeDefinition,
    private readonly recipe: Recipe,
  ) {
    this.type = encodeId(definition.type);
  }

  serialize(context: RecipeParseContext) {
    return {
      ...this.definition,
      ...this.recipe.serialize(context),
    };
  }

  getIngredients() {
    return this.recipe.getIngredients();
  }

  getResults() {
    return this.recipe.getResults();
  }

  // TODO rename modifiy & add modifier object
  replace(
    ingredientReplacer: Replacer<Ingredient>,
    resultReplacer: Replacer<Result>,
  ): RecipeHolder {
    const modified = this.recipe.replace(ingredientReplacer, resultReplacer);
    return new RecipeHolder(this.definition, modified);
  }

  replaceIngredient(replace: Replacer<Ingredient>): RecipeHolder {
    return this.replace(replace, keep());
  }

  replaceResult(replace: Replacer<Result>): RecipeHolder {
    return this.replace(keep(), replace);
  }

  getTypes(): NormalizedId[] {
    return [this.type, ...this.recipe.additionalTypes()];
  }
}

export abstract class Recipe {
  abstract getIngredients(): Ingredient[];

  abstract getResults(): Result[];

  abstract replace(
    ingredientReplacer: Replacer<Ingredient>,
    resultReplacer: Replacer<Result>,
  ): Recipe;

  additionalTypes(): NormalizedId[] {
    return [];
  }

  abstract serialize(context: RecipeParseContext): Partial<RecipeDefinition>;
}

export type RecipeSerializer = {
  deserialize(definition: RecipeDefinition): RecipeHolder;
  serialize(recipe: RecipeHolder): RecipeDefinition;
};

export type RecipeParseContext = Pick<
  PackContext,
  "ingredients" | "results"
> & {
  recipes: RecipeSerializer;
};

export default abstract class RecipeParser<
  TDefinition extends RecipeDefinition,
  TRecipe extends Recipe,
> {
  abstract deserialize(
    definition: TDefinition,
    context: RecipeParseContext,
  ): TRecipe;
}
