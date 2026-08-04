import type { Ingredient, PackContext, Result } from "@/common";
import { encodeId, type NormalizedId } from "@/common";
import type { Predicate } from "@/io";
import type { RecipeDefinition } from "@/schema";
import type { WithSerializerModules } from "../module";

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

export type RecipeModifier = {
  result: Replacer<Result>;
  ingredient: Replacer<Ingredient>;
};

export class RecipeHolder {
  readonly serializerType: NormalizedId;

  constructor(
    private readonly definition: RecipeDefinition,
    private readonly recipe: Recipe,
  ) {
    this.serializerType = encodeId(definition.type);
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

  modify(modifier: RecipeModifier): RecipeHolder {
    const modified = this.recipe.modify(modifier);
    return new RecipeHolder(this.definition, modified);
  }

  replaceIngredient(replace: Replacer<Ingredient>): RecipeHolder {
    return this.modify({
      ingredient: replace,
      result: keep(),
    });
  }

  replaceResult(replace: Replacer<Result>): RecipeHolder {
    return this.modify({
      ingredient: keep(),
      result: replace,
    });
  }

  getTypes(): NormalizedId[] {
    return [this.serializerType, ...this.recipe.additionalTypes()];
  }
}

export abstract class Recipe {
  abstract getIngredients(): Ingredient[];

  abstract getResults(): Result[];

  abstract modify(modifier: RecipeModifier): Recipe;

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
  TDefinition extends RecipeDefinition = RecipeDefinition,
  TRecipe extends Recipe = Recipe,
> implements WithSerializerModules {
  ingredientModules() {
    return {};
  }

  resultModules() {
    return {};
  }

  abstract deserialize(
    definition: TDefinition,
    context: RecipeParseContext,
  ): TRecipe;
}
