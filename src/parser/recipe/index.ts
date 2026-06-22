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

export abstract class Recipe {
  // TODO would be pretty cool if this could go await
  constructor(public readonly definition: RecipeDefinition) {}

  abstract getIngredients(): Ingredient[];

  replaceIngredient(replace: Replacer<Ingredient>) {
    return this.replace(replace, keep());
  }

  abstract getResults(): Result[];

  replaceResult(replace: Replacer<Result>) {
    return this.replace(keep(), replace);
  }

  abstract replace(
    ingredientReplacer: Replacer<Ingredient>,
    resultReplacer: Replacer<Result>,
  ): Recipe;

  getTypes() {
    return [this.definition.type];
  }

  abstract serialize(context: RecipeParseContext): Partial<RecipeDefinition>;
}

export type RecipeSerializer = {
  deserialize(definition: RecipeDefinition): Recipe;
  serialize(recipe: Recipe): RecipeDefinition;
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
